<?php

namespace App\Modules\Auth\Repositories\Eloquent;

use App\Modules\Auth\Models\User;
use App\Modules\Auth\Repositories\Contracts\RoleRepositoryInterface;
use Spatie\Permission\Models\Role;

class RoleRepository implements RoleRepositoryInterface
{
    public function findByName(string $name, string $guard = 'web'): ?Role
    {
        return Role::query()
            ->where('name', $name)
            ->where('guard_name', $guard)
            ->first();
    }

    public function firstOrCreate(string $name, string $guard = 'web'): Role
    {
        return Role::findOrCreate($name, $guard);
    }

    public function ensureRolesExist(array $roles, string $guard = 'web'): void
    {
        foreach ($roles as $role) {
            $this->firstOrCreate($role, $guard);
        }
    }

    public function assignRole(User $user, string $role, string $guard = 'web'): void
    {
        $user->assignRole($this->firstOrCreate($role, $guard));
    }

    public function syncRoles(User $user, array $roles, string $guard = 'web'): void
    {
        $this->ensureRolesExist($roles, $guard);
        $user->syncRoles($roles);
    }

    public function getRoleNames(User $user): array
    {
        return $user->getRoleNames()->all();
    }
}
