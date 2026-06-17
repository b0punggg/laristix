<?php

namespace App\Modules\Auth\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case OrganizerOwner = 'organizer_owner';
    case OrganizerAdmin = 'organizer_admin';
    case OrganizerStaff = 'organizer_staff';
    case EventScanner = 'event_scanner';
    case Participant = 'participant';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::OrganizerOwner => 'Organizer Owner',
            self::OrganizerAdmin => 'Organizer Admin',
            self::OrganizerStaff => 'Organizer Staff',
            self::EventScanner => 'Event Scanner',
            self::Participant => 'Participant',
        };
    }
}
