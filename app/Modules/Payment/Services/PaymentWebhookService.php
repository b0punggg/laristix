<?php

namespace App\Modules\Payment\Services;

use App\Modules\Order\Repositories\Contracts\OrderRepositoryInterface;
use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Contracts\PaymentWebhookServiceInterface;
use App\Modules\Payment\Exceptions\InvalidPaymentSignatureException;
use App\Modules\Payment\Exceptions\PaymentException;
use App\Modules\Payment\Repositories\Contracts\PaymentRepositoryInterface;

class PaymentWebhookService implements PaymentWebhookServiceInterface
{
    public function __construct(
        private readonly PaymentGatewayInterface $gateway,
        private readonly PaymentRepositoryInterface $payments,
        private readonly OrderRepositoryInterface $orders,
        private readonly PaymentStatusSyncService $statusSync,
    ) {}

    public function handleMidtransNotification(array $payload, ?string $ipAddress): array
    {
        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signatureKey = (string) ($payload['signature_key'] ?? '');
        $transactionStatus = (string) ($payload['transaction_status'] ?? 'pending');
        $transactionId = (string) ($payload['transaction_id'] ?? $orderId);
        $gatewayEventId = $transactionId.':'.$transactionStatus.':'.$statusCode;

        if ($orderId === '') {
            throw PaymentException::make('Missing order_id in payment notification.');
        }

        if (! $this->gateway->verifyNotificationSignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            throw new InvalidPaymentSignatureException();
        }

        if ($this->payments->logExists('midtrans', $gatewayEventId)) {
            return ['processed' => true, 'message' => 'Notification already processed.'];
        }

        $order = $this->orders->findByOrderNumber($orderId);

        if ($order === null) {
            throw PaymentException::make('Order not found for payment notification.', 404);
        }

        $payment = $order->payment;

        if ($payment === null) {
            throw PaymentException::make('Payment record not found for order.', 404);
        }

        $log = $this->payments->createLog([
            'payment_id' => $payment->id,
            'order_id' => $order->id,
            'organizer_id' => $order->organizer_id,
            'gateway' => 'midtrans',
            'event_type' => $transactionStatus,
            'gateway_event_id' => $gatewayEventId,
            'payload' => $payload,
            'response_status' => (int) $statusCode,
            'ip_address' => $ipAddress,
            'processed' => false,
            'created_at' => now(),
        ]);

        try {
            $this->statusSync->sync($payment, $payload, 'webhook');

            $log->fill([
                'processed' => true,
                'processed_at' => now(),
            ]);
            $log->save();

            return ['processed' => true, 'message' => 'Notification processed successfully.'];
        } catch (\Throwable $e) {
            $log->fill([
                'error_message' => $e->getMessage(),
            ]);
            $log->save();

            throw $e;
        }
    }
}
