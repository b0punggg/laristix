<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventAttendeeServiceInterface;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventAttendeeController extends Controller
{
    public function __construct(
        private readonly EventAttendeeServiceInterface $attendees,
        private readonly EventRepositoryInterface $events,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function index(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();
        $event = $this->findEventOrFail($uuid, $organizer->id);

        $validated = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'order_status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $paginator = $this->attendees->paginate(
            $event,
            $organizer,
            $user,
            $validated['search'] ?? null,
            $validated['order_status'] ?? null,
            (int) ($validated['per_page'] ?? 25),
        );

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function showOrder(Request $request, string $uuid, string $orderUuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();
        $event = $this->findEventOrFail($uuid, $organizer->id);

        return response()->json([
            'data' => $this->attendees->showOrder($event, $organizer, $user, $orderUuid),
        ]);
    }

    private function findEventOrFail(string $uuid, int $organizerId)
    {
        $event = $this->events->findByUuidForOrganizer($uuid, $organizerId);

        if ($event === null) {
            throw EventNotFoundException::make();
        }

        return $event;
    }

    private function requireCurrentOrganizer()
    {
        $organizer = $this->organizerContext->organizer();

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        return $organizer;
    }
}
