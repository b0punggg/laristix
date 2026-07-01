<?php

namespace App\Modules\Auth\Repositories\Contracts;

use App\Modules\Auth\Models\User;
use Spatie\Permission\Models\Role;

interface RoleRepositoryInterface
{
    public function findByName(string $name, string $guard = 'web'): ?Role;

    public function firstOrCreate(string $name, string $guard = 'web'): Role;

    /**
     * @param  list<string>  $roles
     */
    public function ensureRolesExist(array $roles, string $guard = 'web'): void;

    public function assignRole(User $user, string $role, string $guard = 'web'): void;

    /**
     * @param  list<string>  $roles
     */
    public function syncRoles(User $user, array $roles, string $guard = 'web'): void;

    /**
     * @return list<string>
     */
    public function getRoleNames(User $user): array;
}
