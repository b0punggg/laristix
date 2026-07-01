<?php

namespace App\Core\Tenancy\Services;

use App\Core\Tenancy\Contracts\OrganizerMembershipValidatorInterface;
use App\Core\Tenancy\Exceptions\InactiveOrganizerException;
use App\Core\Tenancy\Exceptions\OrganizerMembershipRequiredException;
use App\Core\Tenancy\Scopes\OrganizerScope;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;

class OrganizerMembershipValidator implements OrganizerMembershipValidatorInterface
{
    /** @var list<string> */
    private $accessibleOrganizerStatuses;

    public function __construct()
    {
        $this->accessibleOrganizerStatuses = config('tenancy.accessible_organizer_statuses', ['active']);
    }

    public function findActiveMembership(User $user, int $organizerId): ?OrganizerMember
    {
        return OrganizerMember::query()
            ->where('user_id', $user->id)
            ->where('organizer_id', $organizerId)
            ->where('status', 'active')
            ->first();
    }

    public function validateMembership(User $user, int $organizerId): OrganizerMember
    {
        $membership = $this->findActiveMembership($user, $organizerId);

        if ($membership === null) {
            throw OrganizerMembershipRequiredException::forUserAndOrganizer($user->id, $organizerId);
        }

        return $membership;
    }

    public function validateOrganizerIsAccessible(Organizer $organizer): void
    {
        if (! in_array($organizer->status, $this->accessibleOrganizerStatuses, true)) {
            throw InactiveOrganizerException::withStatus($organizer->status);
        }
    }

    public function hasActiveMembership(User $user, int $organizerId): bool
    {
        return $this->findActiveMembership($user, $organizerId) !== null;
    }
}
