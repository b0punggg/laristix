<?php

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\Models\User;

interface UserRoleResolverInterface
{
    /**
     * Resolve all effective roles for the user.
     *
     * @return list<string>
     */
    public function resolveRoles(User $user, ?int $activeOrganizerId = null): array;

    public function resolvePrimaryRole(User $user, ?int $activeOrganizerId = null): string;
}
