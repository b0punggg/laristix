<?php

namespace App\Modules\Payment\Services;

use App\Modules\Order\Models\Order;
use App\Modules\Payment\Contracts\MidtransSnapServiceInterface;
use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Exceptions\PaymentException;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Repositories\Contracts\PaymentRepositoryInterface;

class MidtransSnapService implements MidtransSnapServiceInterface
{
    public function __construct(
        private readonly PaymentGatewayInterface $gateway,
        private readonly PaymentRepositoryInterface $payments,
    ) {}

    public function initiate(Order $order): Payment
    {
        if (! $order->requiresPayment()) {
            throw PaymentException::make('This order does not require payment.');
        }

        $payment = $this->payments->create([
            'order_id' => $order->id,
            'organizer_id' => $order->organizer_id,
            'gateway' => config('payment_module.gateway', 'midtrans'),
            'gateway_transaction_id' => $order->order_number,
            'status' => PaymentStatus::PENDING,
            'amount' => $order->total_amount,
            'currency' => $order->currency,
            'expired_at' => $order->expires_at,
        ]);

        $frontendUrl = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) round((float) $order->total_amount),
            ],
            'customer_details' => [
                'first_name' => $order->buyer_name,
                'email' => $order->buyer_email,
                'phone' => $order->buyer_phone ?? '',
            ],
            'callbacks' => [
                'finish' => "{$frontendUrl}/checkout/{$order->uuid}/finish",
            ],
        ];

        $snapResponse = $this->gateway->createSnapTransaction($payload);

        if (! isset($snapResponse['token'])) {
            throw PaymentException::make('Midtrans did not return a Snap token.');
        }

        return $this->payments->update($payment, [
            'gateway_response' => [
                'snap_token' => $snapResponse['token'],
                'redirect_url' => $snapResponse['redirect_url'] ?? null,
                'snap_response' => $snapResponse,
            ],
        ]);
    }
}
