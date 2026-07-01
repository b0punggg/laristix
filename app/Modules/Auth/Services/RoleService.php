<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Contracts\RoleServiceInterface;
use App\Modules\Auth\Enums\UserRole;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Repositories\Contracts\RoleRepositoryInterface;
use App\Modules\Organizer\Models\OrganizerMember;

class RoleService implements RoleServiceInterface
{
    /** @var RoleRepositoryInterface */
    private $roles;

    public function __construct(RoleRepositoryInterface $roles)
    {
        $this->roles = $roles;
    }

    public function seedApplicationRoles(): void
    {
        $this->roles->ensureRolesExist(UserRole::values());
    }

    public function assignDefaultRoleOnRegister(User $user): void
    {
        $this->seedApplicationRoles();
        $this->roles->assignRole($user, UserRole::PARTICIPANT);
    }

    public function syncUserRoles(User $user, ?int $activeOrganizerId = null): void
    {
        $this->seedApplicationRoles();

        if ($user->isSuperAdmin()) {
            $this->roles->syncRoles($user, [UserRole::SUPER_ADMIN]);

            return;
        }

        $applicationRole = $this->resolveRoleFromMembership($user, $activeOrganizerId);
        $this->roles->syncRoles($user, [$applicationRole]);
    }

    private function resolveRoleFromMembership(User $user, ?int $activeOrganizerId): string
    {
        $query = OrganizerMember::query()
            ->where('user_id', $user->id)
            ->where('status', 'active');

        if ($activeOrganizerId !== null) {
            $query->where('organizer_id', $activeOrganizerId);
        }

        $membershipRoles = $query->pluck('role')->unique()->all();

        if ($membershipRoles === []) {
            return UserRole::PARTICIPANT;
        }

        if (array_intersect($membershipRoles, ['owner', 'admin']) !== []) {
            return UserRole::ORGANIZER;
        }

        if (array_intersect($membershipRoles, ['staff', 'scanner']) !== []) {
            return UserRole::STAFF;
        }

        return UserRole::PARTICIPANT;
    }
}
