<?php

namespace App\Modules\CheckIn\Repositories\Eloquent;

use App\Modules\CheckIn\Contracts\CheckInRepositoryInterface;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\Order\Models\Ticket;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CheckInRepository implements CheckInRepositoryInterface
{
    public function create(array $attributes): CheckIn
    {
        return CheckIn::withoutOrganizerScope()->create($attributes);
    }

    public function existsForTicket(int $ticketId): bool
    {
        return CheckIn::withoutOrganizerScope()
            ->where('ticket_id', $ticketId)
            ->exists();
    }

    public function paginateForEvent(int $eventId, int $perPage = 20): LengthAwarePaginator
    {
        return CheckIn::withoutOrganizerScope()
            ->with(['ticket.ticketType', 'registration', 'gate', 'scanner:id,name,email'])
            ->where('event_id', $eventId)
            ->orderByDesc('checked_in_at')
            ->paginate($perPage);
    }

    public function countForEvent(int $eventId): int
    {
        return CheckIn::withoutOrganizerScope()
            ->where('event_id', $eventId)
            ->count();
    }

    public function findTicketByQrToken(string $qrToken): ?Ticket
    {
        $normalized = $this->normalizeQrToken($qrToken);
        $hash = hash('sha256', $normalized);

        return Ticket::withoutOrganizerScope()
            ->with(['registration', 'ticketType', 'event'])
            ->where('qr_token_hash', $hash)
            ->first();
    }

    public function findTicketByCode(string $ticketCode): ?Ticket
    {
        return Ticket::withoutOrganizerScope()
            ->with(['registration', 'ticketType', 'event'])
            ->where('ticket_code', strtoupper(trim($ticketCode)))
            ->first();
    }

    public function findTicketForUser(string $ticketUuid, int $userId): ?Ticket
    {
        return Ticket::withoutOrganizerScope()
            ->with(['registration.order', 'ticketType', 'event'])
            ->where('uuid', $ticketUuid)
            ->whereHas('registration.order', fn ($q) => $q->where('user_id', $userId))
            ->first();
    }

    private function normalizeQrToken(string $input): string
    {
        $trimmed = trim($input);
        $prefix = (string) config('check_in_module.qr_prefix', 'LX:');

        if (str_starts_with($trimmed, $prefix)) {
            return substr($trimmed, strlen($prefix));
        }

        return $trimmed;
    }
}
