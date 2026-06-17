<?php

namespace App\Core\Tenancy\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;

interface OrganizerMembershipValidatorInterface
{
    public function findActiveMembership(User $user, int $organizerId): ?OrganizerMember;

    public function validateMembership(User $user, int $organizerId): OrganizerMember;

    public function validateOrganizerIsAccessible(Organizer $organizer): void;

    public function hasActiveMembership(User $user, int $organizerId): bool;
}
