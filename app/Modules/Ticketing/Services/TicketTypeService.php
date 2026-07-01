<?php

namespace App\Modules\Ticketing\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use App\Modules\Ticketing\Contracts\TicketTypeServiceInterface;
use App\Modules\Ticketing\DTOs\CreateTicketTypeDto;
use App\Modules\Ticketing\DTOs\UpdateTicketTypeDto;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Enums\TicketTypeStatus;
use App\Modules\Ticketing\Exceptions\TicketingAccessDeniedException;
use App\Modules\Ticketing\Exceptions\TicketTypeValidationException;
use App\Modules\Ticketing\Models\TicketType;
use App\Modules\Ticketing\Repositories\Contracts\TicketTypeRepositoryInterface;
use Illuminate\Support\Collection;

class TicketTypeService implements TicketTypeServiceInterface
{
    /** @var TicketTypeRepositoryInterface */
    private $ticketTypes;

    /** @var OrganizerMemberRepositoryInterface */
    private $members;

    public function __construct(
        TicketTypeRepositoryInterface $ticketTypes,
        OrganizerMemberRepositoryInterface $members
    ) {
        $this->ticketTypes = $ticketTypes;
        $this->members = $members;
    }

    public function create(Event $event, User $user, CreateTicketTypeDto $dto): TicketType
    {
        $this->assertCanManage($event->organizer, $user);
        $this->assertEventAllowsTicketManagement($event);

        $price = $this->resolvePriceForKind($dto->kind, $dto->price);
        $this->assertSalesPeriod($dto->salesStartAt, $dto->salesEndAt);
        $this->assertOrderLimits($dto->minPerOrder, $dto->maxPerOrder);
        $this->assertQuota($dto->quantity);

        $name = trim($dto->name ?? '') !== ''
            ? $dto->name
            : TicketKind::defaultName($dto->kind);

        $ticketType = $this->ticketTypes->create([
            'event_id' => $event->id,
            'organizer_id' => $event->organizer_id,
            'name' => $name,
            'kind' => $dto->kind,
            'description' => $dto->description,
            'price' => $price,
            'currency' => $dto->currency,
            'quantity' => $dto->quantity,
            'sold_count' => 0,
            'reserved_count' => 0,
            'min_per_order' => $dto->minPerOrder,
            'max_per_order' => $dto->maxPerOrder,
            'sales_start_at' => $dto->salesStartAt,
            'sales_end_at' => $dto->salesEndAt,
            'visibility' => $dto->visibility,
            'sort_order' => $dto->sortOrder,
            'status' => TicketTypeStatus::ACTIVE,
        ]);

        return $this->ticketTypes->syncSoldOutStatus($ticketType);
    }

    public function update(Event $event, TicketType $ticketType, User $user, UpdateTicketTypeDto $dto): TicketType
    {
        $this->assertCanManage($event->organizer, $user);
        $this->assertTicketBelongsToEvent($event, $ticketType);

        if (! $ticketType->canEdit()) {
            throw TicketingAccessDeniedException::make('Archived ticket types cannot be edited.');
        }

        $attributes = $dto->toArray();

        if (array_key_exists('price', $attributes)) {
            $attributes['price'] = $this->resolvePriceForKind($ticketType->kind, $attributes['price']);
        }

        if (array_key_exists('min_per_order', $attributes) || array_key_exists('max_per_order', $attributes)) {
            $this->assertOrderLimits(
                $attributes['min_per_order'] ?? $ticketType->min_per_order,
                $attributes['max_per_order'] ?? $ticketType->max_per_order
            );
        }

        if (array_key_exists('quantity', $attributes)) {
            $this->assertQuotaUpdate($ticketType, (int) $attributes['quantity']);
        }

        $salesStart = $attributes['sales_start_at'] ?? $ticketType->sales_start_at?->toIso8601String();
        $salesEnd = $attributes['sales_end_at'] ?? $ticketType->sales_end_at?->toIso8601String();

        if (array_key_exists('sales_start_at', $attributes) || array_key_exists('sales_end_at', $attributes)) {
            $this->assertSalesPeriod($salesStart, $salesEnd);
        }

        $updated = $this->ticketTypes->update($ticketType, $attributes);

        return $this->ticketTypes->syncSoldOutStatus($updated);
    }

    public function delete(Event $event, TicketType $ticketType, User $user): void
    {
        $this->assertCanManage($event->organizer, $user);
        $this->assertTicketBelongsToEvent($event, $ticketType);

        if (! $ticketType->canDelete()) {
            throw TicketingAccessDeniedException::make(
                'Ticket types with sales or reservations cannot be deleted. Archive instead.'
            );
        }

        $this->ticketTypes->delete($ticketType);
    }

    public function show(Event $event, TicketType $ticketType, User $user): TicketType
    {
        $this->assertCanView($event->organizer, $user);
        $this->assertTicketBelongsToEvent($event, $ticketType);

        return $ticketType;
    }

    public function listForEvent(Event $event, User $user, array $filters = []): Collection
    {
        $this->assertCanView($event->organizer, $user);

        return $this->ticketTypes->listForEvent($event->id, $filters);
    }

    public function listPublic(Event $event): Collection
    {
        if (! in_array($event->status, EventStatus::publicVisible(), true)) {
            return collect();
        }

        return $this->ticketTypes->listPublicForEvent($event->id)
            ->filter(fn (TicketType $ticketType) => $ticketType->isPurchasable())
            ->values();
    }

    private function resolvePriceForKind(string $kind, ?float $price): float
    {
        if ($kind === TicketKind::FREE) {
            if ($price !== null && (float) $price !== 0.0) {
                throw TicketTypeValidationException::make('Free tickets must have a price of 0.');
            }

            return 0.0;
        }

        if ($price === null || (float) $price <= 0) {
            throw TicketTypeValidationException::make(
                ucfirst($kind).' tickets must have a price greater than 0.'
            );
        }

        return round((float) $price, 2);
    }

    private function assertSalesPeriod(?string $startAt, ?string $endAt): void
    {
        if ($startAt === null || $endAt === null) {
            return;
        }

        if (strtotime($endAt) <= strtotime($startAt)) {
            throw TicketTypeValidationException::make('Sales end must be after sales start.');
        }
    }

    private function assertOrderLimits(int $min, int $max): void
    {
        if ($min < 1) {
            throw TicketTypeValidationException::make('Minimum per order must be at least 1.');
        }

        if ($max < $min) {
            throw TicketTypeValidationException::make('Maximum per order must be greater than or equal to minimum.');
        }
    }

    private function assertQuota(int $quantity): void
    {
        if ($quantity < 1) {
            throw TicketTypeValidationException::make('Quota must be at least 1.');
        }
    }

    private function assertQuotaUpdate(TicketType $ticketType, int $quantity): void
    {
        $this->assertQuota($quantity);

        $allocated = $ticketType->sold_count + $ticketType->reserved_count;

        if ($quantity < $allocated) {
            throw TicketTypeValidationException::make(
                "Quota cannot be less than already sold or reserved ({$allocated})."
            );
        }
    }

    private function assertEventAllowsTicketManagement(Event $event): void
    {
        if (! in_array($event->status, [EventStatus::DRAFT, EventStatus::PUBLISHED], true)) {
            throw TicketingAccessDeniedException::make(
                'Tickets can only be managed for draft or published events.'
            );
        }
    }

    private function assertTicketBelongsToEvent(Event $event, TicketType $ticketType): void
    {
        if ($ticketType->event_id !== $event->id) {
            throw TicketingAccessDeniedException::make('Ticket type does not belong to this event.');
        }
    }

    private function assertCanManage(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null || ! in_array($membership->role, OrganizerMemberRole::managers(), true)) {
            throw TicketingAccessDeniedException::make();
        }
    }

    private function assertCanView(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null) {
            throw TicketingAccessDeniedException::make();
        }
    }
}
