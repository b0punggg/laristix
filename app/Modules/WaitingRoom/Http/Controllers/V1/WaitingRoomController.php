<?php

namespace App\Modules\WaitingRoom\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\WaitingRoom\Contracts\WaitingRoomServiceInterface;
use App\Modules\WaitingRoom\Exceptions\WaitingRoomException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WaitingRoomController extends Controller
{
    public function __construct(
        private readonly WaitingRoomServiceInterface $waitingRoom,
    ) {}

    public function status(Request $request, string $eventUuid): JsonResponse
    {
        $event = $this->resolveEvent($eventUuid);

        $validated = $request->validate([
            'session_token' => ['nullable', 'string', 'max:64'],
        ]);

        $status = $this->waitingRoom->status(
            $event,
            $validated['session_token'] ?? null,
        );

        return response()->json(['data' => $status]);
    }

    public function join(Request $request, string $eventUuid): JsonResponse
    {
        $event = $this->resolveEvent($eventUuid);

        $validated = $request->validate([
            'session_token' => ['nullable', 'string', 'max:64'],
            'ticket_type_id' => ['nullable', 'integer', 'min:1'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $status = $this->waitingRoom->join(
            event: $event,
            sessionToken: $validated['session_token'] ?? null,
            userId: $request->user()?->id,
            ticketTypeId: isset($validated['ticket_type_id']) ? (int) $validated['ticket_type_id'] : null,
            quantity: (int) ($validated['quantity'] ?? 1),
        );

        return response()->json(['data' => $status]);
    }

    private function resolveEvent(string $eventUuid): Event
    {
        $event = Event::withoutOrganizerScope()
            ->where('uuid', $eventUuid)
            ->whereIn('status', EventStatus::publicVisible())
            ->where('visibility', 'public')
            ->first();

        if ($event === null) {
            throw WaitingRoomException::invalidSession('Event is not available.');
        }

        return $event;
    }
}
