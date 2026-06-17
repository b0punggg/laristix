<?php

namespace App\Core\Tenancy\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;

interface OrganizerContextInterface
{
    public function set(Organizer $organizer, User $user, OrganizerMember $membership): void;

    public function clear(): void;

    public function has(): bool;

    public function getOrganizerId(): ?int;

    public function getUserId(): ?int;

    public function organizer(): ?Organizer;

    public function user(): ?User;

    public function membership(): ?OrganizerMember;

    public function role(): ?string;

    /**
     * @throws \App\Core\Tenancy\Exceptions\OrganizerContextRequiredException
     */
    public function requireOrganizerId(): int;

    /**
     * @throws \App\Core\Tenancy\Exceptions\OrganizerContextRequiredException
     */
    public function requireMembership(): OrganizerMember;
}
