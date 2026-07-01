<?php

namespace App\Modules\Auth\Enums;

class UserRole
{
    public const SUPER_ADMIN = 'super_admin';

    public const ORGANIZER = 'organizer';

    public const STAFF = 'staff';

    public const PARTICIPANT = 'participant';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::SUPER_ADMIN,
            self::ORGANIZER,
            self::STAFF,
            self::PARTICIPANT,
        ];
    }

    /**
     * Highest precedence first (used for primary role resolution).
     *
     * @return list<string>
     */
    public static function priority(): array
    {
        return [
            self::SUPER_ADMIN,
            self::ORGANIZER,
            self::STAFF,
            self::PARTICIPANT,
        ];
    }
}
