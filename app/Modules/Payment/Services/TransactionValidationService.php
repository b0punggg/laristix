<?php

namespace App\Modules\Payment\Services;

use App\Modules\Order\Exceptions\OrderNotFoundException;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Repositories\Contracts\OrderRepositoryInterface;
use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Contracts\TransactionValidationServiceInterface;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Exceptions\PaymentException;

class TransactionValidationService implements TransactionValidationServiceInterface
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly PaymentGatewayInterface $gateway,
        private readonly PaymentStatusSyncService $statusSync,
    ) {}

    public function validateOrderPayment(Order $order): array
    {
        $order = $this->orders->findByUuid($order->uuid) ?? throw OrderNotFoundException::make();

        if (! $order->requiresPayment()) {
            return [
                'valid' => $order->isCompleted(),
                'payment_status' => PaymentStatus::label(PaymentStatus::PAID),
                'order_status' => $order->status,
                'message' => 'Free order does not require payment validation.',
            ];
        }

        $payment = $order->payment;

        if ($payment === null) {
            throw PaymentException::make('No payment record found for this order.');
        }

        $remote = $this->gateway->getTransactionStatus($order->order_number);
        $payment = $this->statusSync->sync($payment, $remote, 'validation');

        $order = $this->orders->findByUuid($order->uuid) ?? $order;

        return [
            'valid' => PaymentStatus::isPaid($payment->status) && $order->isCompleted(),
            'payment_status' => PaymentStatus::label($payment->status),
            'order_status' => $order->status,
            'message' => PaymentStatus::isPaid($payment->status)
                ? 'Payment validated successfully.'
                : 'Payment is not completed yet.',
        ];
    }
}
