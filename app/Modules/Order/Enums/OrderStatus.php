<?php

namespace App\Modules\Order\Enums;

final class OrderStatus
{
    public const PENDING = 'pending';

    public const AWAITING_PAYMENT = 'awaiting_payment';

    public const PAID = 'paid';

    public const COMPLETED = 'completed';

    public const EXPIRED = 'expired';

    public const CANCELLED = 'cancelled';

    public const REFUNDED = 'refunded';

    public const PARTIALLY_REFUNDED = 'partially_refunded';

    /**
     * @return list<string>
     */
    public static function open(): array
    {
        return [self::PENDING, self::AWAITING_PAYMENT];
    }

    /**
     * @return list<string>
     */
    public static function terminal(): array
    {
        return [
            self::COMPLETED,
            self::EXPIRED,
            self::CANCELLED,
            self::REFUNDED,
            self::PARTIALLY_REFUNDED,
        ];
    }
}
