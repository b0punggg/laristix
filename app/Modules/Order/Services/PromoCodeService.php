<?php

namespace App\Modules\Order\Services;

use App\Modules\Event\Models\Event;
use App\Modules\Order\Contracts\PromoCodeServiceInterface;
use App\Modules\Order\Exceptions\CheckoutException;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\PromoCode;
use App\Modules\Order\Models\PromoCodeUsage;

class PromoCodeService implements PromoCodeServiceInterface
{
    public function findForEvent(Event $event, string $code): ?PromoCode
    {
        $normalized = $this->normalizeCode($code);

        if ($normalized === '') {
            return null;
        }

        return PromoCode::withoutOrganizerScope()
            ->where('organizer_id', $event->organizer_id)
            ->whereRaw('UPPER(code) = ?', [$normalized])
            ->first();
    }

    public function validate(PromoCode $promo, Event $event, float $subtotal): void
    {
        if (! $promo->is_active) {
            throw CheckoutException::make('Kode promo tidak aktif.');
        }

        if ($promo->event_id !== null && (int) $promo->event_id !== (int) $event->id) {
            throw CheckoutException::make('Kode promo tidak berlaku untuk event ini.');
        }

        if ($promo->valid_from !== null && $promo->valid_from->isFuture()) {
            throw CheckoutException::make('Kode promo belum berlaku.');
        }

        if ($promo->valid_until !== null && $promo->valid_until->isPast()) {
            throw CheckoutException::make('Kode promo sudah kedaluwarsa.');
        }

        if ($promo->min_order_amount !== null && $subtotal < (float) $promo->min_order_amount) {
            throw CheckoutException::make(
                'Minimal transaksi untuk kode promo ini adalah Rp '.number_format((float) $promo->min_order_amount, 0, ',', '.').'.'
            );
        }

        if (! $promo->hasRemainingUsage()) {
            throw CheckoutException::make('Kuota penggunaan kode promo sudah habis.');
        }
    }

    public function calculateDiscount(PromoCode $promo, float $subtotal): float
    {
        if ($subtotal <= 0) {
            return 0.0;
        }

        $discount = $promo->discount_type === 'percentage'
            ? round($subtotal * (float) $promo->discount_value / 100, 2)
            : round((float) $promo->discount_value, 2);

        if ($promo->max_discount_amount !== null) {
            $discount = min($discount, (float) $promo->max_discount_amount);
        }

        return min(max(0, $discount), $subtotal);
    }

    public function reserve(Order $order, PromoCode $promo, float $discountApplied): void
    {
        if (PromoCodeUsage::withoutOrganizerScope()->where('order_id', $order->id)->exists()) {
            return;
        }

        PromoCodeUsage::withoutOrganizerScope()->create([
            'promo_code_id' => $promo->id,
            'order_id' => $order->id,
            'organizer_id' => $order->organizer_id,
            'discount_applied' => $discountApplied,
            'created_at' => now(),
        ]);

        PromoCode::withoutOrganizerScope()
            ->whereKey($promo->id)
            ->increment('usage_count');
    }

    public function release(Order $order): void
    {
        $usage = PromoCodeUsage::withoutOrganizerScope()
            ->where('order_id', $order->id)
            ->first();

        if ($usage === null) {
            return;
        }

        PromoCode::withoutOrganizerScope()
            ->whereKey($usage->promo_code_id)
            ->where('usage_count', '>', 0)
            ->decrement('usage_count');

        $usage->delete();
    }

    private function normalizeCode(string $code): string
    {
        return strtoupper(trim($code));
    }
}
