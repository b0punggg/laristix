<?php

namespace App\Modules\Order\Contracts;

use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\PromoCode;

interface PromoCodeServiceInterface
{
    public function findForEvent(Event $event, string $code): ?PromoCode;

    public function validate(PromoCode $promo, Event $event, float $subtotal): void;

    public function calculateDiscount(PromoCode $promo, float $subtotal): float;

    public function reserve(Order $order, PromoCode $promo, float $discountApplied): void;

    public function release(Order $order): void;
}
