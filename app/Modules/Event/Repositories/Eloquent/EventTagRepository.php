<?php

namespace App\Modules\Event\Repositories\Eloquent;

use App\Modules\Event\Models\EventTag;
use App\Modules\Event\Repositories\Contracts\EventTagRepositoryInterface;
use Illuminate\Support\Collection;

class EventTagRepository implements EventTagRepositoryInterface
{
    public function listAvailableForOrganizer(?int $organizerId): Collection
    {
        return EventTag::query()
            ->where('is_active', true)
            ->where(function ($query) use ($organizerId) {
                $query->whereNull('organizer_id');

                if ($organizerId !== null) {
                    $query->orWhere('organizer_id', $organizerId);
                }
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    public function findForOrganizer(?int $organizerId, int $tagId): ?EventTag
    {
        return EventTag::query()
            ->where('id', $tagId)
            ->where(function ($query) use ($organizerId) {
                $query->whereNull('organizer_id');

                if ($organizerId !== null) {
                    $query->orWhere('organizer_id', $organizerId);
                }
            })
            ->first();
    }

    public function create(array $attributes): EventTag
    {
        return EventTag::query()->create($attributes);
    }

    public function slugExists(?int $organizerId, string $slug, ?int $exceptId = null): bool
    {
        $query = EventTag::query()->where('slug', $slug);

        if ($organizerId === null) {
            $query->whereNull('organizer_id');
        } else {
            $query->where('organizer_id', $organizerId);
        }

        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->exists();
    }
}
