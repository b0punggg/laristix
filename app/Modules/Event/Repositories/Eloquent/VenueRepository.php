<?php

namespace App\Modules\Event\Repositories\Eloquent;

use App\Modules\Event\Models\Venue;
use App\Modules\Event\Repositories\Contracts\VenueRepositoryInterface;
use Illuminate\Support\Collection;

class VenueRepository implements VenueRepositoryInterface
{
    public function findById(int $id): ?Venue
    {
        return Venue::query()->find($id);
    }

    public function findForOrganizer(int $organizerId, int $venueId): ?Venue
    {
        return Venue::query()
            ->where('organizer_id', $organizerId)
            ->where('id', $venueId)
            ->first();
    }

    public function create(array $attributes): Venue
    {
        return Venue::query()->create($attributes);
    }

    public function update(Venue $venue, array $attributes): Venue
    {
        $venue->fill($attributes);
        $venue->save();

        return $venue->fresh();
    }

    public function delete(Venue $venue): void
    {
        $venue->delete();
    }

    public function listForOrganizer(int $organizerId): Collection
    {
        return Venue::query()
            ->where('organizer_id', $organizerId)
            ->orderBy('name')
            ->get();
    }
}
