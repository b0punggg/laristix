<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Contracts\RoleServiceInterface;
use App\Modules\Auth\Contracts\UserRoleResolverInterface;
use App\Modules\Auth\Enums\UserRole;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Repositories\Contracts\RoleRepositoryInterface;

class UserRoleResolver implements UserRoleResolverInterface
{
    /** @var RoleRepositoryInterface */
    private $roles;

    /** @var RoleServiceInterface */
    private $roleService;

    public function __construct(
        RoleRepositoryInterface $roles,
        RoleServiceInterface $roleService
    ) {
        $this->roles = $roles;
        $this->roleService = $roleService;
    }

    public function resolveRoles(User $user, ?int $activeOrganizerId = null): array
    {
        $this->roleService->syncUserRoles($user, $activeOrganizerId);

        return $this->roles->getRoleNames($user);
    }

    public function resolvePrimaryRole(User $user, ?int $activeOrganizerId = null): string
    {
        $roles = $this->resolveRoles($user, $activeOrganizerId);

        foreach (UserRole::priority() as $role) {
            if (in_array($role, $roles, true)) {
                return $role;
            }
        }

        return UserRole::PARTICIPANT;
    }
}
