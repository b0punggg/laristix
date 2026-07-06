<?php

namespace App\Modules\Organizer\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Contracts\OrganizerAnalyticsServiceInterface;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use App\Modules\Organizer\Http\Requests\OrganizerAnalyticsTrendsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizerDashboardController extends Controller
{
    public function __construct(
        private readonly OrganizerAnalyticsServiceInterface $analytics,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function summary(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        return response()->json([
            'data' => $this->analytics->summary($organizer, $user),
        ]);
    }

    public function trends(OrganizerAnalyticsTrendsRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        return response()->json([
            'data' => $this->analytics->trends(
                $organizer,
                $user,
                (int) ($request->validated('days') ?? 30)
            ),
        ]);
    }

    public function insights(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        return response()->json([
            'data' => $this->analytics->insights($organizer, $user),
        ]);
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
