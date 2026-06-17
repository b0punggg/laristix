<?php

namespace Tests\Unit\Modules\Auth;

use App\Modules\Auth\Enums\UserRole;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class UserRoleEnumTest extends TestCase
{
    #[Test]
    public function it_maps_organizer_member_roles_to_user_roles(): void
    {
        $this->assertSame('organizer_owner', UserRole::OrganizerOwner->value);
        $this->assertSame('organizer_admin', UserRole::OrganizerAdmin->value);
        $this->assertSame('organizer_staff', UserRole::OrganizerStaff->value);
        $this->assertSame('event_scanner', UserRole::EventScanner->value);
        $this->assertSame('participant', UserRole::Participant->value);
        $this->assertSame('super_admin', UserRole::SuperAdmin->value);
    }
}
