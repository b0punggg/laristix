<?php

namespace App\Modules\Event\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\VenueServiceInterface;
use App\Modules\Event\DTOs\CreateVenueDto;
use App\Modules\Event\Exceptions\EventAccessDeniedException;
use App\Modules\Event\Exceptions\VenueNotFoundException;
use App\Modules\Event\Models\Venue;
use App\Modules\Event\Repositories\Contracts\VenueRepositoryInterface;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Support\Collection;

class VenueService implements VenueServiceInterface
{
    /** @var VenueRepositoryInterface */
    private $venues;

    /** @var OrganizerMemberRepositoryInterface */
    private $members;

    public function __construct(
        VenueRepositoryInterface $venues,
        OrganizerMemberRepositoryInterface $members
    ) {
        $this->venues = $venues;
        $this->members = $members;
    }

    public function list(Organizer $organizer, User $user): Collection
    {
        $this->assertCanView($organizer, $user);

        return $this->venues->listForOrganizer($organizer->id);
    }

    public function create(Organizer $organizer, User $user, CreateVenueDto $dto): Venue
    {
        $this->assertCanManage($organizer, $user);

        return $this->venues->create([
            'organizer_id' => $organizer->id,
            'name' => $dto->name,
            'type' => $dto->type,
            'address' => $dto->address,
            'city' => $dto->city,
            'province' => $dto->province,
            'country_code' => $dto->countryCode,
            'postal_code' => $dto->postalCode,
            'latitude' => $dto->latitude,
            'longitude' => $dto->longitude,
            'online_url' => $dto->onlineUrl,
            'capacity' => $dto->capacity,
        ]);
    }

    public function delete(Organizer $organizer, User $user, int $venueId): void
    {
        $this->assertCanManage($organizer, $user);

        $venue = $this->venues->findForOrganizer($organizer->id, $venueId);

        if ($venue === null) {
            throw VenueNotFoundException::make();
        }

        $this->venues->delete($venue);
    }

    private function assertCanManage(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null || ! in_array($membership->role, OrganizerMemberRole::managers(), true)) {
            throw EventAccessDeniedException::make();
        }
    }

    private function assertCanView(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        if ($this->members->findActiveMembership($user->id, $organizer->id) === null) {
            throw EventAccessDeniedException::make();
        }
    }
}
