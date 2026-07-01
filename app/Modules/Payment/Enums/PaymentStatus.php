<?php

namespace App\Modules\Payment\Enums;

final class PaymentStatus
{
    public const PENDING = 'pending';

    public const PROCESSING = 'processing';

    public const PAID = 'success';

    public const FAILED = 'failed';

    public const EXPIRED = 'expired';

    public const REFUNDED = 'refunded';

    public const PARTIALLY_REFUNDED = 'partially_refunded';

    public static function label(string $status): string
    {
        return match ($status) {
            self::PENDING, self::PROCESSING => 'pending',
            self::PAID => 'paid',
            self::FAILED => 'failed',
            self::EXPIRED => 'expired',
            self::REFUNDED, self::PARTIALLY_REFUNDED => 'refunded',
            default => $status,
        };
    }

    public static function fromMidtrans(string $transactionStatus, ?string $fraudStatus = null): string
    {
        return match ($transactionStatus) {
            'capture' => $fraudStatus === 'challenge' ? self::PROCESSING : self::PAID,
            'settlement' => self::PAID,
            'pending' => self::PENDING,
            'deny', 'cancel' => self::FAILED,
            'expire' => self::EXPIRED,
            'refund' => self::REFUNDED,
            'partial_refund' => self::PARTIALLY_REFUNDED,
            default => self::PENDING,
        };
    }

    public static function isPaid(string $status): bool
    {
        return $status === self::PAID;
    }

    public static function isTerminal(string $status): bool
    {
        return in_array($status, [self::PAID, self::FAILED, self::EXPIRED, self::REFUNDED, self::PARTIALLY_REFUNDED], true);
    }
}
