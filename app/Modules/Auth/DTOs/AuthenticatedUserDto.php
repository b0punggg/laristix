<?php

namespace App\Modules\Auth\DTOs;

class AuthenticatedUserDto
{
    /** @var int */
    public $id;

    /** @var string */
    public $uuid;

    /** @var string */
    public $name;

    /** @var string */
    public $email;

    /** @var string|null */
    public $phone;

    /** @var string|null */
    public $avatarUrl;

    /** @var bool */
    public $emailVerified;

    /** @var list<string> */
    public $roles;

    /** @var array<string, mixed>|null */
    public $activeOrganizer;

    /** @var array<string, mixed>|null */
    public $activeMembership;

    /** @var string|null */
    public $primaryRole;

    /**
     * @param  list<string>  $roles
     * @param  array<string, mixed>|null  $activeOrganizer
     * @param  array<string, mixed>|null  $activeMembership
     */
    public function __construct(
        int $id,
        string $uuid,
        string $name,
        string $email,
        ?string $phone,
        ?string $avatarUrl,
        bool $emailVerified,
        array $roles,
        ?array $activeOrganizer = null,
        ?array $activeMembership = null,
        ?string $primaryRole = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->name = $name;
        $this->email = $email;
        $this->phone = $phone;
        $this->avatarUrl = $avatarUrl;
        $this->emailVerified = $emailVerified;
        $this->roles = $roles;
        $this->activeOrganizer = $activeOrganizer;
        $this->activeMembership = $activeMembership;
        $this->primaryRole = $primaryRole;
    }

    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles, true);
    }
}
