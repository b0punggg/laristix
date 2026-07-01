<?php

namespace App\Modules\Event\Enums;

class VenueType
{
    public const PHYSICAL = 'physical';

    public const ONLINE = 'online';

    public const HYBRID = 'hybrid';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::PHYSICAL,
            self::ONLINE,
            self::HYBRID,
        ];
    }
}
