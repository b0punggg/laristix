<?php

namespace Tests\Unit\Core\Tenancy;

use App\Core\Tenancy\Contracts\OrganizerMembershipValidatorInterface;
use App\Core\Tenancy\Exceptions\OrganizerAccessDeniedException;
use App\Core\Tenancy\Services\ActiveOrganizerService;
use App\Modules\Auth\Models\User;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ActiveOrganizerServiceTest extends TestCase
{
    private function makeSession(array $data = []): Store
    {
        $session = new Store('test', new ArraySessionHandler(120));
        $session->start();

        foreach ($data as $key => $value) {
            $session->put($key, $value);
        }

        return $session;
    }

    #[Test]
    public function it_returns_session_organizer_when_membership_is_valid(): void
    {
        $session = $this->makeSession(['active_organizer_id' => 7]);
        $validator = $this->createMock(OrganizerMembershipValidatorInterface::class);
        $validator->method('hasActiveMembership')->willReturn(true);

        $service = new ActiveOrganizerService($session, $validator);
        $user = new User;
        $user->id = 1;

        $this->assertSame(7, $service->getActiveOrganizerId($user));
    }

    #[Test]
    public function it_rejects_header_hint_without_membership(): void
    {
        config(['tenancy.auto_select_single_organizer' => false]);

        $session = $this->makeSession([]);
        $validator = $this->createMock(OrganizerMembershipValidatorInterface::class);
        $validator->method('hasActiveMembership')->willReturn(false);

        $service = new ActiveOrganizerService($session, $validator);
        $user = new User;
        $user->id = 1;

        $this->expectException(OrganizerAccessDeniedException::class);

        $service->resolveOrganizerId($user, 99);
    }

    #[Test]
    public function it_clears_session_on_clear(): void
    {
        $session = $this->makeSession(['active_organizer_id' => 5]);
        $validator = $this->createMock(OrganizerMembershipValidatorInterface::class);

        $service = new ActiveOrganizerService($session, $validator);
        $user = new User;

        $service->clear($user);

        $this->assertNull($session->get('active_organizer_id'));
    }
}
