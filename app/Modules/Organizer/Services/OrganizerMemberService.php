<?php

namespace App\Modules\Organizer\Services;

use App\Modules\Auth\Contracts\RoleServiceInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Modules\Organizer\Contracts\OrganizerMemberServiceInterface;
use App\Modules\Organizer\DTOs\InviteOrganizerMemberDto;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class OrganizerMemberService implements OrganizerMemberServiceInterface
{
    /** @var OrganizerMemberRepositoryInterface */
    private $members;

    /** @var UserRepositoryInterface */
    private $users;

    /** @var RoleServiceInterface */
    private $roleService;

    public function __construct(
        OrganizerMemberRepositoryInterface $members,
        UserRepositoryInterface $users,
        RoleServiceInterface $roleService
    ) {
        $this->members = $members;
        $this->users = $users;
        $this->roleService = $roleService;
    }

    public function list(Organizer $organizer, User $user): Collection
    {
        $this->assertMemberOrManager($organizer, $user);

        return $this->members->listForOrganizer($organizer->id);
    }

    public function invite(Organizer $organizer, User $inviter, InviteOrganizerMemberDto $dto): OrganizerMember
    {
        $actorMembership = $this->assertCanManageMembers($organizer, $inviter);

        if ($dto->role === OrganizerMemberRole::OWNER && ! $actorMembership->isOwner()) {
            throw OrganizerAccessDeniedException::make('Only the owner can assign the owner role.');
        }

        $invitee = $this->users->findByEmail($dto->email);

        if ($invitee === null) {
            throw OrganizerAccessDeniedException::make('No user found with that email address.');
        }

        if ($this->members->membershipExists($invitee->id, $organizer->id)) {
            throw OrganizerAccessDeniedException::make('User is already a member or has a pending invitation.');
        }

        return $this->members->create([
            'organizer_id' => $organizer->id,
            'user_id' => $invitee->id,
            'role' => $dto->role,
            'invited_by' => $inviter->id,
            'invited_at' => now(),
            'status' => 'pending',
        ]);
    }

    public function update(
        Organizer $organizer,
        User $actor,
        OrganizerMember $member,
        ?string $role = null,
        ?string $status = null
    ): OrganizerMember {
        $this->assertMemberBelongsToOrganizer($organizer, $member);
        $actorMembership = $this->assertCanManageMembers($organizer, $actor);

        if ($member->isOwner() && ! $actorMembership->isOwner()) {
            throw OrganizerAccessDeniedException::make('Only the owner can modify owner membership.');
        }

        if ($role === OrganizerMemberRole::OWNER && ! $actorMembership->isOwner()) {
            throw OrganizerAccessDeniedException::make('Only the owner can assign the owner role.');
        }

        $attributes = [];

        if ($role !== null) {
            $attributes['role'] = $role;
        }

        if ($status !== null) {
            $attributes['status'] = $status;

            if ($status === 'active' && $member->accepted_at === null) {
                $attributes['accepted_at'] = now();
            }
        }

        return DB::transaction(function () use ($member, $attributes, $organizer) {
            $updated = $this->members->update($member, $attributes);

            if ($updated->user !== null) {
                $this->roleService->syncUserRoles($updated->user, $organizer->id);
            }

            return $updated->load(['user', 'invitedBy']);
        });
    }

    public function remove(Organizer $organizer, User $actor, OrganizerMember $member): void
    {
        $this->assertMemberBelongsToOrganizer($organizer, $member);
        $actorMembership = $this->assertCanManageMembers($organizer, $actor);

        if ($member->isOwner()) {
            throw OrganizerAccessDeniedException::make('The owner membership cannot be removed.');
        }

        if ($member->user_id === $actor->id && ! $actorMembership->isOwner()) {
            throw OrganizerAccessDeniedException::make('You cannot remove your own membership.');
        }

        DB::transaction(function () use ($member, $organizer) {
            $userId = $member->user_id;

            $this->members->update($member, ['status' => 'removed']);

            $memberUser = $this->users->findById($userId);

            if ($memberUser !== null) {
                $this->roleService->syncUserRoles($memberUser, $organizer->id);
            }
        });
    }

    private function assertMemberOrManager(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null) {
            throw OrganizerAccessDeniedException::make();
        }
    }

    private function assertCanManageMembers(Organizer $organizer, User $user): OrganizerMember
    {
        if ($user->isSuperAdmin()) {
            $membership = $this->members->findActiveMembership($user->id, $organizer->id);

            if ($membership !== null) {
                return $membership;
            }

            return new OrganizerMember([
                'organizer_id' => $organizer->id,
                'user_id' => $user->id,
                'role' => OrganizerMemberRole::OWNER,
                'status' => 'active',
            ]);
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null || ! $membership->canManageMembers()) {
            throw OrganizerAccessDeniedException::make();
        }

        return $membership;
    }

    private function assertMemberBelongsToOrganizer(Organizer $organizer, OrganizerMember $member): void
    {
        if ($member->organizer_id !== $organizer->id) {
            throw OrganizerAccessDeniedException::make();
        }
    }
}
