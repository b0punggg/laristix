<?php

namespace Tests\Unit\Core\Tenancy;

use App\Core\Tenancy\Exceptions\OrganizerContextRequiredException;
use App\Core\Tenancy\Services\OrganizerContext;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OrganizerContextTest extends TestCase
{
    private OrganizerContext $context;

    protected function setUp(): void
    {
        parent::setUp();
        $this->context = new OrganizerContext;
    }

    #[Test]
    public function it_starts_empty(): void
    {
        $this->assertFalse($this->context->has());
        $this->assertNull($this->context->getOrganizerId());
    }

    #[Test]
    public function it_stores_organizer_user_and_membership(): void
    {
        $organizer = new Organizer(['id' => 10, 'name' => 'Acme']);
        $organizer->id = 10;

        $user = new User(['id' => 1, 'name' => 'Staff']);
        $user->id = 1;

        $membership = new OrganizerMember(['role' => 'admin', 'status' => 'active']);
        $membership->id = 5;

        $this->context->set($organizer, $user, $membership);

        $this->assertTrue($this->context->has());
        $this->assertSame(10, $this->context->getOrganizerId());
        $this->assertSame(1, $this->context->getUserId());
        $this->assertSame('admin', $this->context->role());
    }

    #[Test]
    public function it_clears_state(): void
    {
        $organizer = new Organizer;
        $organizer->id = 1;
        $user = new User;
        $user->id = 1;
        $membership = new OrganizerMember;

        $this->context->set($organizer, $user, $membership);
        $this->context->clear();

        $this->assertFalse($this->context->has());
    }

    #[Test]
    public function require_organizer_id_throws_when_empty(): void
    {
        $this->expectException(OrganizerContextRequiredException::class);

        $this->context->requireOrganizerId();
    }
}
