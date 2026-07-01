<?php

namespace App\Modules\Event\Repositories\Contracts;

use App\Modules\Event\Models\Venue;
use Illuminate\Support\Collection;

interface VenueRepositoryInterface
{
    public function findById(int $id): ?Venue;

    public function findForOrganizer(int $organizerId, int $venueId): ?Venue;

    public function create(array $attributes): Venue;

    public function update(Venue $venue, array $attributes): Venue;

    public function delete(Venue $venue): void;

    /**
     * @return Collection<int, Venue>
     */
    public function listForOrganizer(int $organizerId): Collection;
}
