<?php

namespace App\Modules\Ticketing\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use App\Modules\Ticketing\Contracts\TicketTypeServiceInterface;
use App\Modules\Ticketing\DTOs\CreateTicketTypeDto;
use App\Modules\Ticketing\DTOs\UpdateTicketTypeDto;
use App\Modules\Ticketing\Exceptions\TicketTypeNotFoundException;
use App\Modules\Ticketing\Http\Requests\ListTicketTypesRequest;
use App\Modules\Ticketing\Http\Requests\StoreTicketTypeRequest;
use App\Modules\Ticketing\Http\Requests\UpdateTicketTypeRequest;
use App\Modules\Ticketing\Http\Resources\TicketTypeResource;
use App\Modules\Ticketing\Repositories\Contracts\TicketTypeRepositoryInterface;
use Illuminate\Http\JsonResponse;

class TicketTypeManagementController extends Controller
{
    public function __construct(
        private readonly TicketTypeServiceInterface $ticketTypeService,
        private readonly TicketTypeRepositoryInterface $ticketTypes,
        private readonly EventRepositoryInterface $events,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function index(ListTicketTypesRequest $request, string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $event = $this->findEventOrFail($eventUuid);

        $ticketTypes = $this->ticketTypeService->listForEvent(
            $event,
            $user,
            $request->validated()
        );

        return response()->json([
            'data' => TicketTypeResource::collection($ticketTypes),
        ]);
    }

    public function store(StoreTicketTypeRequest $request, string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $event = $this->findEventOrFail($eventUuid);

        $ticketType = $this->ticketTypeService->create($event, $user, new CreateTicketTypeDto(
            kind: $request->validated('kind'),
            quantity: (int) $request->validated('quantity'),
            currency: $request->validated('currency') ?? 'IDR',
            name: $request->validated('name'),
            description: $request->validated('description'),
            price: $request->validated('price') !== null ? (float) $request->validated('price') : null,
            minPerOrder: (int) ($request->validated('min_per_order') ?? 1),
            maxPerOrder: (int) ($request->validated('max_per_order') ?? 10),
            salesStartAt: $request->validated('sales_start_at'),
            salesEndAt: $request->validated('sales_end_at'),
            visibility: $request->validated('visibility') ?? 'public',
            sortOrder: (int) ($request->validated('sort_order') ?? 0),
        ));

        return response()->json([
            'message' => 'Ticket type created successfully.',
            'data' => new TicketTypeResource($ticketType),
        ], 201);
    }

    public function show(string $eventUuid, int $ticketTypeId): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();
        $event = $this->findEventOrFail($eventUuid);
        $ticketType = $this->findTicketTypeOrFail($event->id, $ticketTypeId);

        return response()->json([
            'data' => new TicketTypeResource($this->ticketTypeService->show($event, $ticketType, $user)),
        ]);
    }

    public function update(UpdateTicketTypeRequest $request, string $eventUuid, int $ticketTypeId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $event = $this->findEventOrFail($eventUuid);
        $ticketType = $this->findTicketTypeOrFail($event->id, $ticketTypeId);

        $updated = $this->ticketTypeService->update($event, $ticketType, $user, new UpdateTicketTypeDto(
            name: $request->validated('name'),
            description: $request->validated('description'),
            price: $request->has('price') ? (float) $request->validated('price') : null,
            currency: $request->validated('currency'),
            quantity: $request->has('quantity') ? (int) $request->validated('quantity') : null,
            minPerOrder: $request->has('min_per_order') ? (int) $request->validated('min_per_order') : null,
            maxPerOrder: $request->has('max_per_order') ? (int) $request->validated('max_per_order') : null,
            salesStartAt: $request->validated('sales_start_at'),
            salesEndAt: $request->validated('sales_end_at'),
            visibility: $request->validated('visibility'),
            sortOrder: $request->has('sort_order') ? (int) $request->validated('sort_order') : null,
            status: $request->validated('status'),
        ));

        return response()->json([
            'message' => 'Ticket type updated successfully.',
            'data' => new TicketTypeResource($updated),
        ]);
    }

    public function destroy(string $eventUuid, int $ticketTypeId): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();
        $event = $this->findEventOrFail($eventUuid);
        $ticketType = $this->findTicketTypeOrFail($event->id, $ticketTypeId);

        $this->ticketTypeService->delete($event, $ticketType, $user);

        return response()->json([
            'message' => 'Ticket type deleted successfully.',
        ]);
    }

    private function findEventOrFail(string $uuid)
    {
        $organizer = $this->organizerContext->organizer();

        if ($organizer === null) {
            throw EventNotFoundException::make();
        }

        $event = $this->events->findByUuidForOrganizer($uuid, $organizer->id);

        if ($event === null) {
            throw EventNotFoundException::make();
        }

        return $event;
    }

    private function findTicketTypeOrFail(int $eventId, int $ticketTypeId)
    {
        $ticketType = $this->ticketTypes->findForEvent($eventId, $ticketTypeId);

        if ($ticketType === null) {
            throw TicketTypeNotFoundException::make();
        }

        return $ticketType;
    }
}
