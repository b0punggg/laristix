<?php

namespace App\Modules\Event\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Event\DTOs\CreateVenueDto;
use App\Modules\Event\Models\Venue;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Support\Collection;

interface VenueServiceInterface
{
    /**
     * @return Collection<int, Venue>
     */
    public function list(Organizer $organizer, User $user): Collection;

    public function create(Organizer $organizer, User $user, CreateVenueDto $dto): Venue;

    public function delete(Organizer $organizer, User $user, int $venueId): void;
}
