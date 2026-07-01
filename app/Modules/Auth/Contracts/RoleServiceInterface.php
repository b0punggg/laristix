<?php

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\Models\User;

interface RoleServiceInterface
{
    public function seedApplicationRoles(): void;

    public function assignDefaultRoleOnRegister(User $user): void;

    public function syncUserRoles(User $user, ?int $activeOrganizerId = null): void;
}
