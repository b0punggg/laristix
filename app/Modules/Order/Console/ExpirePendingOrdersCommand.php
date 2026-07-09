<?php

namespace App\Modules\Order\Console;

use App\Modules\Order\Contracts\OrderFulfillmentServiceInterface;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpirePendingOrdersCommand extends Command
{
    protected $signature = 'orders:expire-pending';

    protected $description = 'Expire pending checkout orders and release reserved ticket inventory';

    public function handle(OrderFulfillmentServiceInterface $fulfillment): int
    {
        $expiredCount = 0;

        Order::withoutOrganizerScope()
            ->whereIn('status', OrderStatus::open())
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->orderBy('id')
            ->chunkById(100, function ($orders) use ($fulfillment, &$expiredCount) {
                foreach ($orders as $order) {
                    DB::transaction(function () use ($order, $fulfillment, &$expiredCount) {
                        $lockedOrder = Order::withoutOrganizerScope()
                            ->whereKey($order->id)
                            ->lockForUpdate()
                            ->first();

                        if ($lockedOrder === null) {
                            return;
                        }

                        if (! in_array($lockedOrder->status, OrderStatus::open(), true)) {
                            return;
                        }

                        if ($lockedOrder->expires_at === null || $lockedOrder->expires_at->isFuture()) {
                            return;
                        }

                        $fulfillment->releaseReservation($lockedOrder);

                        $lockedOrder->fill([
                            'status' => OrderStatus::EXPIRED,
                            'cancelled_at' => now(),
                        ]);
                        $lockedOrder->save();

                        $payment = Payment::withoutOrganizerScope()
                            ->where('order_id', $lockedOrder->id)
                            ->lockForUpdate()
                            ->first();

                        if ($payment !== null && ! PaymentStatus::isPaid($payment->status)) {
                            $payment->fill([
                                'status' => PaymentStatus::EXPIRED,
                                'expired_at' => now(),
                            ]);
                            $payment->save();
                        }

                        $expiredCount++;
                    });
                }
            });

        $this->info("Expired {$expiredCount} pending order(s).");

        return self::SUCCESS;
    }
}
