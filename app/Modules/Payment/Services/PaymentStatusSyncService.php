<?php

namespace App\Modules\Payment\Services;

use App\Modules\Order\Contracts\OrderFulfillmentServiceInterface;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Repositories\Contracts\OrderRepositoryInterface;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Exceptions\PaymentException;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Support\Facades\DB;

class PaymentStatusSyncService
{
    public function __construct(
        private readonly PaymentRepositoryInterface $payments,
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderFulfillmentServiceInterface $fulfillment,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public function sync(Payment $payment, array $payload, string $source): Payment
    {
        return DB::transaction(function () use ($payment, $payload, $source) {
            $payment = Payment::withoutOrganizerScope()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $order = $this->orders->lockForUpdate($payment->order);

            $transactionStatus = (string) ($payload['transaction_status'] ?? 'pending');
            $fraudStatus = isset($payload['fraud_status']) ? (string) $payload['fraud_status'] : null;
            $newStatus = PaymentStatus::fromMidtrans($transactionStatus, $fraudStatus);
            $grossAmount = (float) ($payload['gross_amount'] ?? $payload['transaction_details']['gross_amount'] ?? 0);

            $this->assertAmountMatches($order, $grossAmount);

            $payment->fill([
                'status' => $newStatus,
                'payment_method' => $payload['payment_type'] ?? $payment->payment_method,
                'gateway_response' => array_merge($payment->gateway_response ?? [], [
                    'last_'.$source => $payload,
                ]),
                'paid_at' => PaymentStatus::isPaid($newStatus) ? now() : $payment->paid_at,
                'expired_at' => $newStatus === PaymentStatus::EXPIRED ? now() : $payment->expired_at,
            ]);
            $payment->save();

            if (PaymentStatus::isPaid($newStatus) && ! $order->isCompleted()) {
                $order->fill([
                    'status' => OrderStatus::PAID,
                    'paid_at' => now(),
                ]);
                $order->save();

                $this->fulfillment->fulfill($order);
            } elseif (in_array($newStatus, [PaymentStatus::FAILED, PaymentStatus::EXPIRED], true)
                && in_array($order->status, OrderStatus::open(), true)) {
                $this->fulfillment->releaseReservation($order);

                $order->fill([
                    'status' => $newStatus === PaymentStatus::EXPIRED
                        ? OrderStatus::EXPIRED
                        : OrderStatus::CANCELLED,
                    'cancelled_at' => now(),
                ]);
                $order->save();
            } elseif (in_array($newStatus, [PaymentStatus::REFUNDED, PaymentStatus::PARTIALLY_REFUNDED], true)) {
                $order->fill([
                    'status' => $newStatus === PaymentStatus::REFUNDED
                        ? OrderStatus::REFUNDED
                        : OrderStatus::PARTIALLY_REFUNDED,
                ]);
                $order->save();
            }

            return $payment->fresh(['order']);
        });
    }

    private function assertAmountMatches(Order $order, float $grossAmount): void
    {
        if ($grossAmount <= 0) {
            return;
        }

        $expected = (int) round((float) $order->total_amount);

        if ((int) round($grossAmount) !== $expected) {
            throw PaymentException::make('Payment amount does not match order total.');
        }
    }
}
