<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventWithdrawalServiceInterface;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventWithdrawalController extends Controller
{
    public function __construct(
        private readonly EventWithdrawalServiceInterface $withdrawals,
        private readonly EventRepositoryInterface $events,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function index(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();
        $event = $this->findEventOrFail($uuid, $organizer->id);

        return response()->json([
            'data' => $this->withdrawals->list($event, $organizer, $user),
        ]);
    }

    public function store(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();
        $event = $this->findEventOrFail($uuid, $organizer->id);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'bank_name' => ['required', 'string', 'max:100'],
            'account_holder' => ['required', 'string', 'max:150'],
            'account_number' => ['required', 'string', 'max:50'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        return response()->json([
            'data' => $this->withdrawals->create($event, $organizer, $user, $validated),
        ], 201);
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
