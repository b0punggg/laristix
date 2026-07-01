<?php

namespace App\Modules\Ticketing\Repositories\Contracts;

use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Support\Collection;

interface TicketTypeRepositoryInterface
{
    public function findById(int $id): ?TicketType;

    public function findForEvent(int $eventId, int $ticketTypeId): ?TicketType;

    public function create(array $attributes): TicketType;

    public function update(TicketType $ticketType, array $attributes): TicketType;

    public function delete(TicketType $ticketType): void;

    /**
     * @return Collection<int, TicketType>
     */
    public function listForEvent(int $eventId, array $filters = []): Collection;

    /**
     * @return Collection<int, TicketType>
     */
    public function listPublicForEvent(int $eventId): Collection;

    public function syncSoldOutStatus(TicketType $ticketType): TicketType;
}
