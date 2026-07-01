<?php

namespace App\Modules\Ticketing\Enums;

class TicketTypeStatus
{
    public const ACTIVE = 'active';

    public const SOLD_OUT = 'sold_out';

    public const HIDDEN = 'hidden';

    public const ARCHIVED = 'archived';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::ACTIVE,
            self::SOLD_OUT,
            self::HIDDEN,
            self::ARCHIVED,
        ];
    }

    /**
     * @return list<string>
     */
    public static function publicVisible(): array
    {
        return [
            self::ACTIVE,
            self::SOLD_OUT,
        ];
    }
}
