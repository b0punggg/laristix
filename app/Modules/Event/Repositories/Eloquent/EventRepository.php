<?php

namespace App\Modules\Event\Repositories\Eloquent;

use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Enums\EventVisibility;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EventRepository implements EventRepositoryInterface
{
    public function findById(int $id): ?Event
    {
        return Event::query()->find($id);
    }

    public function findByUuid(string $uuid): ?Event
    {
        return Event::query()->where('uuid', $uuid)->first();
    }

    public function findByUuidForOrganizer(string $uuid, int $organizerId): ?Event
    {
        return Event::query()
            ->where('uuid', $uuid)
            ->where('organizer_id', $organizerId)
            ->first();
    }

    public function create(array $attributes): Event
    {
        return Event::query()->create($attributes);
    }

    public function update(Event $event, array $attributes): Event
    {
        $event->fill($attributes);
        $event->save();

        return $event->fresh();
    }

    public function delete(Event $event): void
    {
        $event->delete();
    }

    public function markAsPublished(Event $event): Event
    {
        $event->fill([
            'status' => EventStatus::PUBLISHED,
            'published_at' => now(),
        ]);
        $event->save();

        return $event->fresh();
    }

    public function markAsDraft(Event $event): Event
    {
        $event->fill([
            'status' => EventStatus::DRAFT,
            'published_at' => null,
        ]);
        $event->save();

        return $event->fresh();
    }

    public function slugExists(int $organizerId, string $slug, ?int $exceptId = null): bool
    {
        $query = Event::query()
            ->where('organizer_id', $organizerId)
            ->where('slug', $slug);

        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->exists();
    }

    public function paginateForOrganizer(int $organizerId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Event::query()
            ->with(['venue', 'category', 'organizer'])
            ->where('organizer_id', $organizerId)
            ->orderByDesc('start_at');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function paginateForPlatform(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Event::withoutOrganizerScope()
            ->with(['venue', 'category', 'organizer'])
            ->orderByDesc('start_at');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['organizer_id'])) {
            $query->where('organizer_id', $filters['organizer_id']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function paginatePublic(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $query = Event::withoutOrganizerScope()
            ->with(['venue', 'category', 'organizer'])
            ->whereIn('status', EventStatus::publicVisible())
            ->where('visibility', EventVisibility::PUBLIC)
            ->whereHas('organizer', fn ($q) => $q->where('status', 'active'))
            ->orderBy('start_at');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('title', 'like', "%{$search}%");
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        return $query->paginate($perPage);
    }

    public function findPublicByUuid(string $uuid): ?Event
    {
        return Event::withoutOrganizerScope()
            ->with(['venue', 'category', 'organizer', 'schedules', 'media'])
            ->where('uuid', $uuid)
            ->whereIn('status', EventStatus::publicVisible())
            ->where('visibility', EventVisibility::PUBLIC)
            ->whereHas('organizer', fn ($q) => $q->where('status', 'active'))
            ->first();
    }
}
