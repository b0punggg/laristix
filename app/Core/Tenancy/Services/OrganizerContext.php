<?php

namespace App\Core\Tenancy\Services;

use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Core\Tenancy\Exceptions\OrganizerContextRequiredException;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;

class OrganizerContext implements OrganizerContextInterface
{
    private ?Organizer $organizer = null;

    private ?User $user = null;

    private ?OrganizerMember $membership = null;

    public function set(Organizer $organizer, User $user, OrganizerMember $membership): void
    {
        $this->organizer = $organizer;
        $this->user = $user;
        $this->membership = $membership;
    }

    public function clear(): void
    {
        $this->organizer = null;
        $this->user = null;
        $this->membership = null;
    }

    public function has(): bool
    {
        return $this->organizer !== null;
    }

    public function getOrganizerId(): ?int
    {
        return $this->organizer?->id;
    }

    public function getUserId(): ?int
    {
        return $this->user?->id;
    }

    public function organizer(): ?Organizer
    {
        return $this->organizer;
    }

    public function user(): ?User
    {
        return $this->user;
    }

    public function membership(): ?OrganizerMember
    {
        return $this->membership;
    }

    public function role(): ?string
    {
        return $this->membership?->role;
    }

    public function requireOrganizerId(): int
    {
        $organizerId = $this->getOrganizerId();

        if ($organizerId === null) {
            throw OrganizerContextRequiredException::make();
        }

        return $organizerId;
    }

    public function requireMembership(): OrganizerMember
    {
        if ($this->membership === null) {
            throw OrganizerContextRequiredException::make();
        }

        return $this->membership;
    }
}
