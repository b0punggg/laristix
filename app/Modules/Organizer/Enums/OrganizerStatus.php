<?php

namespace App\Modules\Organizer\Enums;

class OrganizerStatus
{
    public const PENDING = 'pending';

    public const ACTIVE = 'active';

    public const SUSPENDED = 'suspended';

    public const ARCHIVED = 'archived';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::PENDING,
            self::ACTIVE,
            self::SUSPENDED,
            self::ARCHIVED,
        ];
    }
}
