<?php

namespace App\Modules\Ticketing\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Models\Event;
use App\Modules\Ticketing\Contracts\TicketTypeServiceInterface;
use App\Modules\Ticketing\Http\Resources\TicketTypeResource;
use Illuminate\Http\JsonResponse;

class TicketTypePublicController extends Controller
{
    public function __construct(
        private readonly TicketTypeServiceInterface $ticketTypeService,
    ) {}

    public function index(string $eventUuid): JsonResponse
    {
        $event = Event::withoutOrganizerScope()
            ->where('uuid', $eventUuid)
            ->whereIn('status', ['published', 'live', 'completed'])
            ->where('visibility', 'public')
            ->first();

        if ($event === null) {
            throw EventNotFoundException::make();
        }

        $ticketTypes = $this->ticketTypeService->listPublic($event);

        return response()->json([
            'data' => TicketTypeResource::collection($ticketTypes),
        ]);
    }
}
