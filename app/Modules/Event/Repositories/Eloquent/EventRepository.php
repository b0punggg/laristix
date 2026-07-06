<?php

namespace App\Modules\Event\Repositories\Eloquent;

use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Enums\EventVisibility;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

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
            ->whereHas('organizer', fn ($q) => $q->where('status', 'active'));

        $sort = $filters['sort'] ?? 'start_at';
        match ($sort) {
            'published_at' => $query->orderByDesc('published_at'),
            'title' => $query->orderBy('title'),
            default => $query->orderBy('start_at'),
        };

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhereHas('venue', function ($venueQuery) use ($search) {
                        $venueQuery->where('city', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['city'])) {
            $query->whereHas('venue', fn ($venueQuery) => $venueQuery->where('city', $filters['city']));
        }

        if (array_key_exists('is_free', $filters) && $filters['is_free'] !== null && $filters['is_free'] !== '') {
            $query->where('is_free', filter_var($filters['is_free'], FILTER_VALIDATE_BOOLEAN));
        }

        if (! empty($filters['upcoming_days'])) {
            $days = max(1, min((int) $filters['upcoming_days'], 90));
            $query->where('end_at', '>=', now())
                ->where('start_at', '<=', now()->addDays($days));
        } else {
            $query->where('end_at', '>=', now());
        }

        $ticketTypeConstraint = function ($ticketQuery) {
            $ticketQuery->withoutGlobalScopes()
                ->where('status', 'active')
                ->where('visibility', 'public');
        };

        $query->withMin(['ticketTypes as min_ticket_price' => $ticketTypeConstraint], 'price');
        $query->withSum(['ticketTypes as tickets_quantity' => $ticketTypeConstraint], 'quantity');
        $query->withSum(['ticketTypes as tickets_sold' => $ticketTypeConstraint], 'sold_count');
        $query->withSum(['ticketTypes as tickets_reserved' => $ticketTypeConstraint], 'reserved_count');

        return $query->paginate($perPage);
    }

    public function listPublicCities(): Collection
    {
        $rows = Event::withoutOrganizerScope()
            ->join('venues', 'events.venue_id', '=', 'venues.id')
            ->whereIn('events.status', EventStatus::publicVisible())
            ->where('events.visibility', EventVisibility::PUBLIC)
            ->whereHas('organizer', fn ($q) => $q->where('status', 'active'))
            ->whereNotNull('venues.city')
            ->where('venues.city', '!=', '')
            ->select('venues.city as city', DB::raw('COUNT(*) as events_count'))
            ->groupBy('venues.city')
            ->orderByDesc('events_count')
            ->orderBy('venues.city')
            ->get();

        return $rows->map(fn ($row) => [
            'city' => $row->city,
            'events_count' => (int) $row->events_count,
        ]);
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

    public function countPublicPublished(): int
    {
        return Event::withoutOrganizerScope()
            ->whereIn('status', EventStatus::publicVisible())
            ->where('visibility', EventVisibility::PUBLIC)
            ->whereHas('organizer', fn ($q) => $q->where('status', 'active'))
            ->where('end_at', '>=', now())
            ->count();
    }

    public function countPublicOrganizers(): int
    {
        return (int) Event::withoutOrganizerScope()
            ->whereIn('status', EventStatus::publicVisible())
            ->where('visibility', EventVisibility::PUBLIC)
            ->whereHas('organizer', fn ($q) => $q->where('status', 'active'))
            ->where('end_at', '>=', now())
            ->distinct()
            ->count('organizer_id');
    }

    public function listFeaturedOrganizers(int $limit = 8): Collection
    {
        $publicEventConstraint = function ($query) {
            $query->whereIn('status', EventStatus::publicVisible())
                ->where('visibility', EventVisibility::PUBLIC)
                ->where('end_at', '>=', now());
        };

        return Organizer::query()
            ->where('status', 'active')
            ->whereNotNull('logo_url')
            ->where('logo_url', '!=', '')
            ->whereHas('events', $publicEventConstraint)
            ->withCount(['events as published_events_count' => $publicEventConstraint])
            ->orderByDesc('published_events_count')
            ->orderBy('name')
            ->limit($limit)
            ->get(['id', 'uuid', 'name', 'slug', 'logo_url']);
    }
}
