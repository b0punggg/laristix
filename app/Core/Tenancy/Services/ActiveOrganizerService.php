<?php

namespace App\Core\Tenancy\Services;

use App\Core\Tenancy\Contracts\ActiveOrganizerServiceInterface;
use App\Core\Tenancy\Contracts\OrganizerMembershipValidatorInterface;
use App\Core\Tenancy\Exceptions\OrganizerAccessDeniedException;
use App\Core\Tenancy\Scopes\OrganizerScope;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Contracts\Session\Session;
use Illuminate\Support\Collection;

class ActiveOrganizerService implements ActiveOrganizerServiceInterface
{
    public function __construct(
        private readonly Session $session,
        private readonly OrganizerMembershipValidatorInterface $membershipValidator,
    ) {}

    public function sessionKey(): string
    {
        return config('tenancy.session_key', 'active_organizer_id');
    }

    public function getActiveOrganizerId(User $user): ?int
    {
        $organizerId = $this->session->get($this->sessionKey());

        if ($organizerId === null) {
            return $this->defaultOrganizerIdForUser($user);
        }

        if (! is_numeric($organizerId)) {
            $this->clear($user);

            return $this->defaultOrganizerIdForUser($user);
        }

        $organizerId = (int) $organizerId;

        if (! $this->membershipValidator->hasActiveMembership($user, $organizerId)) {
            $this->clear($user);

            return $this->defaultOrganizerIdForUser($user);
        }

        return $organizerId;
    }

    public function getAvailableOrganizers(User $user): Collection
    {
        $memberships = OrganizerMember::query()
            ->withoutGlobalScope(OrganizerScope::class)
            ->with(['organizer' => fn ($query) => $query->withoutGlobalScope(OrganizerScope::class)])
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->get();

        $accessibleStatuses = config('tenancy.accessible_organizer_statuses', ['active']);

        return $memberships
            ->map(fn (OrganizerMember $membership) => $membership->organizer)
            ->filter()
            ->filter(fn (Organizer $organizer) => in_array($organizer->status, $accessibleStatuses, true))
            ->values();
    }

    public function switch(User $user, int $organizerId): Organizer
    {
        $membership = $this->membershipValidator->validateMembership($user, $organizerId);

        $organizer = Organizer::query()
            ->withoutGlobalScope(OrganizerScope::class)
            ->findOrFail($membership->organizer_id);

        $this->membershipValidator->validateOrganizerIsAccessible($organizer);

        $this->session->put($this->sessionKey(), $organizer->id);

        return $organizer;
    }

    public function clear(User $user): void
    {
        $this->session->forget($this->sessionKey());
    }

    public function resolveOrganizerId(User $user, ?int $requestedOrganizerId = null): ?int
    {
        $sessionOrganizerId = $this->getActiveOrganizerId($user);

        if ($requestedOrganizerId === null) {
            return $sessionOrganizerId;
        }

        if ($sessionOrganizerId !== null && $requestedOrganizerId === $sessionOrganizerId) {
            return $sessionOrganizerId;
        }

        if (! $this->membershipValidator->hasActiveMembership($user, $requestedOrganizerId)) {
            throw OrganizerAccessDeniedException::make(
                'The requested organizer does not match your active membership.'
            );
        }

        return $requestedOrganizerId;
    }

    private function defaultOrganizerIdForUser(User $user): ?int
    {
        if (! config('tenancy.auto_select_single_organizer', true)) {
            return null;
        }

        $available = $this->getAvailableOrganizers($user);

        if ($available->count() !== 1) {
            return null;
        }

        /** @var Organizer $organizer */
        $organizer = $available->first();

        $this->session->put($this->sessionKey(), $organizer->id);

        return $organizer->id;
    }
}
