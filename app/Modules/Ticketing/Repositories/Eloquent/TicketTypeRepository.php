<?php

namespace App\Modules\Ticketing\Repositories\Eloquent;

use App\Modules\Ticketing\Enums\TicketTypeStatus;
use App\Modules\Ticketing\Enums\TicketVisibility;
use App\Modules\Ticketing\Models\TicketType;
use App\Modules\Ticketing\Repositories\Contracts\TicketTypeRepositoryInterface;
use Illuminate\Support\Collection;

class TicketTypeRepository implements TicketTypeRepositoryInterface
{
    public function findById(int $id): ?TicketType
    {
        return TicketType::query()->find($id);
    }

    public function findForEvent(int $eventId, int $ticketTypeId): ?TicketType
    {
        return TicketType::query()
            ->where('event_id', $eventId)
            ->where('id', $ticketTypeId)
            ->first();
    }

    public function create(array $attributes): TicketType
    {
        return TicketType::query()->create($attributes);
    }

    public function update(TicketType $ticketType, array $attributes): TicketType
    {
        $ticketType->fill($attributes);
        $ticketType->save();

        return $ticketType->fresh();
    }

    public function delete(TicketType $ticketType): void
    {
        $ticketType->delete();
    }

    public function listForEvent(int $eventId, array $filters = []): Collection
    {
        $query = TicketType::query()
            ->where('event_id', $eventId)
            ->orderBy('sort_order')
            ->orderBy('id');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['kind'])) {
            $query->where('kind', $filters['kind']);
        }

        return $query->get();
    }

    public function listPublicForEvent(int $eventId): Collection
    {
        return TicketType::withoutOrganizerScope()
            ->with(['event:id,timezone'])
            ->where('event_id', $eventId)
            ->whereIn('status', TicketTypeStatus::publicVisible())
            ->where('visibility', TicketVisibility::PUBLIC)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function syncSoldOutStatus(TicketType $ticketType): TicketType
    {
        if ($ticketType->availableQuantity() <= 0 && $ticketType->status === TicketTypeStatus::ACTIVE) {
            $ticketType->fill(['status' => TicketTypeStatus::SOLD_OUT]);
            $ticketType->save();

            return $ticketType->fresh();
        }

        if ($ticketType->availableQuantity() > 0 && $ticketType->status === TicketTypeStatus::SOLD_OUT) {
            $ticketType->fill(['status' => TicketTypeStatus::ACTIVE]);
            $ticketType->save();

            return $ticketType->fresh();
        }

        return $ticketType;
    }
}
