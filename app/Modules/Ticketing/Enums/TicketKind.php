<?php

namespace App\Modules\Ticketing\Enums;

class TicketKind
{
    public const FREE = 'free';

    public const PAID = 'paid';

    public const VIP = 'vip';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::FREE,
            self::PAID,
            self::VIP,
        ];
    }

    public static function defaultName(string $kind): string
    {
        return match ($kind) {
            self::FREE => 'Free Ticket',
            self::PAID => 'Paid Ticket',
            self::VIP => 'VIP Ticket',
            default => 'Ticket',
        };
    }
}
