<?php

namespace Tests\Unit\Modules\Organizer;

use App\Modules\Organizer\Enums\OrganizerMemberRole;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OrganizerMemberRoleTest extends TestCase
{
    #[Test]
    public function it_exposes_membership_role_constants(): void
    {
        $this->assertSame('owner', OrganizerMemberRole::OWNER);
        $this->assertSame('admin', OrganizerMemberRole::ADMIN);
        $this->assertSame('staff', OrganizerMemberRole::STAFF);
        $this->assertSame('scanner', OrganizerMemberRole::SCANNER);
    }

    #[Test]
    public function it_lists_assignable_roles_without_owner(): void
    {
        $this->assertSame(['admin', 'staff', 'scanner'], OrganizerMemberRole::assignable());
    }
}
