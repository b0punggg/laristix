<?php

namespace Tests\Unit\Modules\Auth;

use App\Modules\Auth\Enums\UserRole;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class UserRoleEnumTest extends TestCase
{
    #[Test]
    public function it_exposes_expected_role_constants(): void
    {
        $this->assertSame('super_admin', UserRole::SUPER_ADMIN);
        $this->assertSame('organizer', UserRole::ORGANIZER);
        $this->assertSame('staff', UserRole::STAFF);
        $this->assertSame('participant', UserRole::PARTICIPANT);
    }

    #[Test]
    public function it_lists_all_role_values(): void
    {
        $this->assertSame([
            UserRole::SUPER_ADMIN,
            UserRole::ORGANIZER,
            UserRole::STAFF,
            UserRole::PARTICIPANT,
        ], UserRole::values());
    }

    #[Test]
    public function it_orders_roles_by_priority(): void
    {
        $this->assertSame([
            UserRole::SUPER_ADMIN,
            UserRole::ORGANIZER,
            UserRole::STAFF,
            UserRole::PARTICIPANT,
        ], UserRole::priority());
    }
}
