<?php

namespace App\Modules\CheckIn\Services;

use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Contracts\CheckInGateRepositoryInterface;
use App\Modules\CheckIn\Contracts\CheckInRepositoryInterface;
use App\Modules\CheckIn\Contracts\CheckInServiceInterface;
use App\Modules\CheckIn\Enums\CheckInMethod;
use App\Modules\CheckIn\Exceptions\CheckInAccessDeniedException;
use App\Modules\CheckIn\Exceptions\CheckInException;
use App\Modules\CheckIn\Exceptions\InvalidTicketException;
use App\Modules\CheckIn\Exceptions\TicketAlreadyCheckedInException;
use App\Modules\CheckIn\Exceptions\TicketNotFoundException;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\RegistrationStatus;
use App\Modules\Order\Enums\TicketStatus;
use App\Modules\Order\Models\Registration;
use App\Modules\Order\Models\Ticket;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CheckInService implements CheckInServiceInterface
{
    /** @var list<string> */
    private const SCAN_ROLES = [
        OrganizerMemberRole::OWNER,
        OrganizerMemberRole::ADMIN,
        OrganizerMemberRole::STAFF,
        OrganizerMemberRole::SCANNER,
    ];

    public function __construct(
        private readonly CheckInRepositoryInterface $checkIns,
        private readonly CheckInGateRepositoryInterface $gates,
        private readonly OrganizerMemberRepositoryInterface $members,
    ) {}

    public function verify(Event $event, User $user, string $qrTokenOrCode): array
    {
        $this->assertCanScan($event->organizer, $user);

        $ticket = $this->resolveTicket($qrTokenOrCode);

        if ($ticket === null) {
            return [
                'valid' => false,
                'ticket' => null,
                'message' => 'Ticket not found.',
            ];
        }

        try {
            $this->assertTicketEligible($ticket, $event);

            return [
                'valid' => true,
                'ticket' => $this->ticketPreview($ticket),
                'message' => 'Ticket is valid for check-in.',
            ];
        } catch (CheckInException $e) {
            return [
                'valid' => false,
                'ticket' => $this->ticketPreview($ticket),
                'message' => $e->getMessage(),
            ];
        }
    }

    public function scanByQr(Event $event, User $scanner, string $qrToken, ?int $gateId = null, ?string $deviceInfo = null): CheckIn
    {
        $this->assertCanScan($event->organizer, $scanner);

        $ticket = $this->resolveTicket($qrToken);

        if ($ticket === null) {
            throw TicketNotFoundException::notFound();
        }

        return $this->performCheckIn($ticket, $event, $scanner, CheckInMethod::QR_SCAN, $gateId, $deviceInfo);
    }

    public function checkInManual(Event $event, User $scanner, string $ticketCode, ?int $gateId = null, ?string $deviceInfo = null): CheckIn
    {
        $this->assertCanScan($event->organizer, $scanner);

        $ticket = $this->checkIns->findTicketByCode($ticketCode);

        if ($ticket === null) {
            throw TicketNotFoundException::notFound();
        }

        return $this->performCheckIn($ticket, $event, $scanner, CheckInMethod::MANUAL, $gateId, $deviceInfo);
    }

    public function listForEvent(Event $event, User $user, int $perPage = 20): LengthAwarePaginator
    {
        $this->assertCanView($event->organizer, $user);

        return $this->checkIns->paginateForEvent($event->id, $perPage);
    }

    public function statsForEvent(Event $event, User $user): array
    {
        $this->assertCanView($event->organizer, $user);

        $totalTickets = Ticket::withoutOrganizerScope()
            ->where('event_id', $event->id)
            ->whereIn('status', [TicketStatus::VALID, TicketStatus::USED])
            ->count();

        $checkedIn = $this->checkIns->countForEvent($event->id);
        $remaining = max(0, $totalTickets - $checkedIn);
        $rate = $totalTickets > 0 ? round(($checkedIn / $totalTickets) * 100, 1) : 0.0;

        $byMethod = CheckIn::withoutOrganizerScope()
            ->where('event_id', $event->id)
            ->selectRaw('method, COUNT(*) as total')
            ->groupBy('method')
            ->pluck('total', 'method')
            ->all();

        return [
            'total_tickets' => $totalTickets,
            'checked_in' => $checkedIn,
            'remaining' => $remaining,
            'check_in_rate' => $rate,
            'by_method' => $byMethod,
        ];
    }

    public function qrPayloadForTicket(Ticket $ticket, User $user): array
    {
        $ticket->loadMissing(['registration.order', 'event']);

        if ($ticket->registration?->order?->user_id !== $user->id) {
            throw CheckInAccessDeniedException::denied('You do not own this ticket.');
        }

        if ($ticket->qr_token === null || $ticket->qr_token === '') {
            throw InvalidTicketException::invalid('QR token is not available for this ticket.');
        }

        $prefix = (string) config('check_in_module.qr_prefix', 'LX:');

        return [
            'ticket_uuid' => $ticket->uuid,
            'ticket_code' => $ticket->ticket_code,
            'qr_payload' => $prefix.$ticket->qr_token,
            'event_uuid' => $ticket->event?->uuid,
            'status' => $ticket->status,
        ];
    }

    private function performCheckIn(
        Ticket $ticket,
        Event $event,
        User $scanner,
        string $method,
        ?int $gateId,
        ?string $deviceInfo,
    ): CheckIn {
        $this->assertTicketEligible($ticket, $event);
        $this->assertGateBelongsToEvent($event, $gateId);

        return DB::transaction(function () use ($ticket, $event, $scanner, $method, $gateId, $deviceInfo) {
            $lockedTicket = Ticket::withoutOrganizerScope()
                ->whereKey($ticket->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($this->checkIns->existsForTicket($lockedTicket->id) || $lockedTicket->status === TicketStatus::USED) {
                throw TicketAlreadyCheckedInException::alreadyCheckedIn();
            }

            if ($lockedTicket->status !== TicketStatus::VALID) {
                throw InvalidTicketException::invalid('Ticket is not valid for check-in.');
            }

            $registration = Registration::withoutOrganizerScope()
                ->whereKey($lockedTicket->registration_id)
                ->lockForUpdate()
                ->firstOrFail();

            $now = now();

            $checkIn = $this->checkIns->create([
                'ticket_id' => $lockedTicket->id,
                'registration_id' => $registration->id,
                'event_id' => $event->id,
                'organizer_id' => $event->organizer_id,
                'gate_id' => $gateId,
                'scanned_by' => $scanner->id,
                'method' => $method,
                'device_info' => $deviceInfo,
                'checked_in_at' => $now,
            ]);

            $lockedTicket->fill([
                'status' => TicketStatus::USED,
                'used_at' => $now,
                'checked_in_at' => $now,
            ]);
            $lockedTicket->save();

            $registration->fill(['status' => RegistrationStatus::CHECKED_IN]);
            $registration->save();

            return $checkIn->load(['ticket.ticketType', 'registration', 'gate', 'scanner:id,name,email']);
        });
    }

    private function resolveTicket(string $qrTokenOrCode): ?Ticket
    {
        $ticket = $this->checkIns->findTicketByQrToken($qrTokenOrCode);

        if ($ticket !== null) {
            return $ticket;
        }

        if (strlen(trim($qrTokenOrCode)) <= 32) {
            return $this->checkIns->findTicketByCode($qrTokenOrCode);
        }

        return null;
    }

    private function assertTicketEligible(Ticket $ticket, Event $event): void
    {
        if ($ticket->event_id !== $event->id) {
            throw InvalidTicketException::invalid('Ticket does not belong to this event.');
        }

        if ($ticket->status === TicketStatus::USED || $this->checkIns->existsForTicket($ticket->id)) {
            throw TicketAlreadyCheckedInException::alreadyCheckedIn();
        }

        if ($ticket->status === TicketStatus::CANCELLED) {
            throw InvalidTicketException::invalid('Ticket has been cancelled.');
        }

        if ($ticket->status === TicketStatus::EXPIRED) {
            throw InvalidTicketException::invalid('Ticket has expired.');
        }

        if ($ticket->status !== TicketStatus::VALID) {
            throw InvalidTicketException::invalid('Ticket is not valid for check-in.');
        }
    }

    private function assertGateBelongsToEvent(Event $event, ?int $gateId): void
    {
        if ($gateId === null) {
            return;
        }

        $gate = $this->gates->findForEvent($event->id, $gateId);

        if ($gate === null) {
            throw CheckInException::make('Check-in gate not found for this event.', 404);
        }

        if (! $gate->is_active) {
            throw CheckInException::make('Check-in gate is inactive.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function ticketPreview(Ticket $ticket): array
    {
        $ticket->loadMissing(['ticketType', 'registration']);

        return [
            'uuid' => $ticket->uuid,
            'ticket_code' => $ticket->ticket_code,
            'status' => $ticket->status,
            'ticket_type' => $ticket->ticketType?->name,
            'attendee_name' => $ticket->registration?->attendee_name,
            'attendee_email' => $ticket->registration?->attendee_email,
            'checked_in_at' => $ticket->checked_in_at?->toIso8601String(),
        ];
    }

    private function assertCanScan(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null || ! in_array($membership->role, self::SCAN_ROLES, true)) {
            throw CheckInAccessDeniedException::denied();
        }
    }

    private function assertCanView(Organizer $organizer, User $user): void
    {
        $this->assertCanScan($organizer, $user);
    }
}
