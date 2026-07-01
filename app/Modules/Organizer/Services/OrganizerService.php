<?php

namespace App\Modules\Organizer\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Contracts\OrganizerServiceInterface;
use App\Modules\Organizer\DTOs\UpdateOrganizerDto;
use App\Modules\Organizer\Enums\OrganizerStatus;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use Illuminate\Support\Collection;

class OrganizerService implements OrganizerServiceInterface
{
    /** @var OrganizerRepositoryInterface */
    private $organizers;

    /** @var OrganizerMemberRepositoryInterface */
    private $members;

    public function __construct(
        OrganizerRepositoryInterface $organizers,
        OrganizerMemberRepositoryInterface $members
    ) {
        $this->organizers = $organizers;
        $this->members = $members;
    }

    public function show(Organizer $organizer, User $user): Organizer
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);

        return $organizer;
    }

    public function update(Organizer $organizer, User $user, UpdateOrganizerDto $dto): Organizer
    {
        $this->assertCanManageOrganizer($organizer, $user);

        return $this->organizers->update($organizer, $dto->toArray());
    }

    public function approve(Organizer $organizer, User $admin): Organizer
    {
        $this->assertSuperAdmin($admin);

        if ($organizer->status !== OrganizerStatus::PENDING) {
            throw OrganizerAccessDeniedException::make('Only pending organizers can be approved.');
        }

        return $this->organizers->update($organizer, [
            'status' => OrganizerStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => $admin->id,
        ]);
    }

    public function listPending(User $admin): Collection
    {
        $this->assertSuperAdmin($admin);

        return $this->organizers->listPending();
    }

    private function assertMemberOrSuperAdmin(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        if ($this->members->findActiveMembership($user->id, $organizer->id) === null) {
            throw OrganizerAccessDeniedException::make();
        }
    }

    private function assertCanManageOrganizer(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null || ! $membership->canManageMembers()) {
            throw OrganizerAccessDeniedException::make();
        }
    }

    private function assertSuperAdmin(User $user): void
    {
        if (! $user->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make('Super admin access required.');
        }
    }
}
