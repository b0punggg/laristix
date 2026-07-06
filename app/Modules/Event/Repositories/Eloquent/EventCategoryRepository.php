<?php

namespace App\Modules\Event\Repositories\Eloquent;

use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Enums\EventVisibility;
use App\Modules\Event\Models\EventCategory;
use App\Modules\Event\Repositories\Contracts\EventCategoryRepositoryInterface;
use Illuminate\Support\Collection;

class EventCategoryRepository implements EventCategoryRepositoryInterface
{
    public function listAvailableForOrganizer(?int $organizerId): Collection
    {
        return EventCategory::query()
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

    public function findForOrganizer(?int $organizerId, int $categoryId): ?EventCategory
    {
        return EventCategory::query()
            ->where('id', $categoryId)
            ->where(function ($query) use ($organizerId) {
                $query->whereNull('organizer_id');

                if ($organizerId !== null) {
                    $query->orWhere('organizer_id', $organizerId);
                }
            })
            ->first();
    }

    public function listPublicWithEventCounts(): Collection
    {
        return EventCategory::query()
            ->whereNull('organizer_id')
            ->where('is_active', true)
            ->withCount(['events' => function ($query) {
                $query->withoutGlobalScopes()
                    ->whereIn('status', EventStatus::publicVisible())
                    ->where('visibility', EventVisibility::PUBLIC)
                    ->whereHas('organizer', fn ($organizerQuery) => $organizerQuery->where('status', 'active'));
            }])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }
}
