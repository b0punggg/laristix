<?php

namespace App\Modules\Auth\DTOs;

use App\Modules\Auth\Enums\UserRole;

readonly class AuthenticatedUserDto
{
    /**
     * @param  list<string>  $roles
     * @param  array<string, mixed>|null  $activeOrganizer
     * @param  array<string, mixed>|null  $activeMembership
     * @param  string|null  $primaryRole
     */
    public function __construct(
        public int $id,
        public string $uuid,
        public string $name,
        public string $email,
        public ?string $phone,
        public ?string $avatarUrl,
        public bool $emailVerified,
        public array $roles,
        public ?array $activeOrganizer = null,
        public ?array $activeMembership = null,
        public ?string $primaryRole = null,
    ) {}

    public function hasRole(UserRole $role): bool
    {
        return in_array($role->value, $this->roles, true);
    }
}
