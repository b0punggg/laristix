<?php

namespace App\Modules\Ticketing\Enums;

class TicketVisibility
{
    public const PUBLIC = 'public';

    public const HIDDEN = 'hidden';

    public const INVITE_ONLY = 'invite_only';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::PUBLIC,
            self::HIDDEN,
            self::INVITE_ONLY,
        ];
    }
}
