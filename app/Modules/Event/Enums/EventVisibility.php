<?php

namespace App\Modules\Event\Enums;

class EventVisibility
{
    public const PUBLIC = 'public';

    public const PRIVATE = 'private';

    public const UNLISTED = 'unlisted';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::PUBLIC,
            self::PRIVATE,
            self::UNLISTED,
        ];
    }
}
