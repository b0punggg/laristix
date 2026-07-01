<?php

namespace App\Modules\CheckIn\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\Ticket;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CheckInServiceInterface
{
    /**
     * @return array{valid: bool, ticket: array<string, mixed>|null, message: string}
     */
    public function verify(Event $event, User $user, string $qrTokenOrCode): array;

    public function scanByQr(Event $event, User $scanner, string $qrToken, ?int $gateId = null, ?string $deviceInfo = null): CheckIn;

    public function checkInManual(Event $event, User $scanner, string $ticketCode, ?int $gateId = null, ?string $deviceInfo = null): CheckIn;

    public function listForEvent(Event $event, User $user, int $perPage = 20): LengthAwarePaginator;

    /**
     * @return array<string, int|float>
     */
    public function statsForEvent(Event $event, User $user): array;

    /**
     * @return array<string, mixed>
     */
    public function qrPayloadForTicket(Ticket $ticket, User $user): array;
}
