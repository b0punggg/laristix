<?php

namespace App\Modules\Ticketing\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Ticketing\DTOs\CreateTicketTypeDto;
use App\Modules\Ticketing\DTOs\UpdateTicketTypeDto;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Support\Collection;

interface TicketTypeServiceInterface
{
    public function create(Event $event, User $user, CreateTicketTypeDto $dto): TicketType;

    public function update(Event $event, TicketType $ticketType, User $user, UpdateTicketTypeDto $dto): TicketType;

    public function delete(Event $event, TicketType $ticketType, User $user): void;

    public function show(Event $event, TicketType $ticketType, User $user): TicketType;

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, TicketType>
     */
    public function listForEvent(Event $event, User $user, array $filters = []): Collection;

    /**
     * @return Collection<int, TicketType>
     */
    public function listPublic(Event $event): Collection;
}
