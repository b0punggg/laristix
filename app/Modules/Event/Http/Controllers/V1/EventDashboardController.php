<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventAnalyticsServiceInterface;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use App\Modules\Organizer\Http\Requests\OrganizerAnalyticsTrendsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventDashboardController extends Controller
{
    public function __construct(
        private readonly EventAnalyticsServiceInterface $analytics,
        private readonly EventRepositoryInterface $events,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function summary(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();
        $event = $this->findEventOrFail($uuid, $organizer->id);

        return response()->json([
            'data' => $this->analytics->summary($event, $organizer, $user),
        ]);
    }

    public function trends(OrganizerAnalyticsTrendsRequest $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();
        $event = $this->findEventOrFail($uuid, $organizer->id);

        return response()->json([
            'data' => $this->analytics->trends(
                $event,
                $organizer,
                $user,
                (int) ($request->validated('days') ?? 30)
            ),
        ]);
    }

    public function insights(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();
        $event = $this->findEventOrFail($uuid, $organizer->id);

        return response()->json([
            'data' => $this->analytics->insights($event, $organizer, $user),
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
