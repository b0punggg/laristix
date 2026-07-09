<?php

namespace App\Modules\Organizer\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Contracts\OrganizerAnalyticsServiceInterface;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use App\Modules\Organizer\Http\Requests\OrganizerAnalyticsTrendsRequest;
use App\Modules\Organizer\Support\OrganizerFeeResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizerDashboardController extends Controller
{
    public function __construct(
        private readonly OrganizerAnalyticsServiceInterface $analytics,
        private readonly OrganizerContextInterface $organizerContext,
        private readonly OrganizerFeeResolver $feeResolver,
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

    public function scannerSummary(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        return response()->json([
            'data' => $this->analytics->scannerSummary($organizer, $user),
        ]);
    }

    public function feePreview(Request $request): JsonResponse
    {
        $organizer = $this->requireCurrentOrganizer();
        $validated = $request->validate([
            'subtotal' => ['sometimes', 'numeric', 'min:0'],
            'fee_bearer' => ['sometimes', 'string', 'in:attendee,organizer'],
        ]);

        $feeConfig = $this->feeResolver->resolveForOrganizer($organizer->id);
        $feeBearer = $validated['fee_bearer'] ?? $feeConfig['fee_bearer'];
        $subtotal = (float) ($validated['subtotal'] ?? 100000);

        return response()->json([
            'data' => array_merge(
                $feeConfig,
                $this->feeResolver->simulate(
                    $subtotal,
                    $feeConfig['percentage_rate'],
                    $feeConfig['flat_amount'],
                    $feeBearer
                )
            ),
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
