<?php

namespace App\Modules\Organizer\Enums;

class OrganizerMemberRole
{
    public const OWNER = 'owner';

    public const ADMIN = 'admin';

    public const STAFF = 'staff';

    public const SCANNER = 'scanner';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            self::OWNER,
            self::ADMIN,
            self::STAFF,
            self::SCANNER,
        ];
    }

    /**
     * Roles that can be assigned when inviting (not owner).
     *
     * @return list<string>
     */
    public static function assignable(): array
    {
        return [
            self::ADMIN,
            self::STAFF,
            self::SCANNER,
        ];
    }

    /**
     * @return list<string>
     */
    public static function managers(): array
    {
        return [
            self::OWNER,
            self::ADMIN,
        ];
    }
}
