<?php

namespace App\Modules\CheckIn\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\Order\Models\Ticket;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CheckInRepositoryInterface
{
    public function create(array $attributes): CheckIn;

    public function existsForTicket(int $ticketId): bool;

    public function paginateForEvent(int $eventId, int $perPage = 20): LengthAwarePaginator;

    public function countForEvent(int $eventId): int;

    public function findTicketByQrToken(string $qrToken): ?Ticket;

    public function findTicketByCode(string $ticketCode): ?Ticket;

    public function findTicketForUser(string $ticketUuid, int $userId): ?Ticket;
}
