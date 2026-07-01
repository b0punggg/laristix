<?php

namespace App\Modules\Event\Enums;

class EventStatus
{
    public const DRAFT = 'draft';

    public const PUBLISHED = 'published';

    public const LIVE = 'live';

    public const COMPLETED = 'completed';

    public const CANCELLED = 'cancelled';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::DRAFT,
            self::PUBLISHED,
            self::LIVE,
            self::COMPLETED,
            self::CANCELLED,
        ];
    }

    /**
     * @return list<string>
     */
    public static function publicVisible(): array
    {
        return [
            self::PUBLISHED,
            self::LIVE,
            self::COMPLETED,
        ];
    }
}
