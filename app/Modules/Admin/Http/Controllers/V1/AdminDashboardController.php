<?php

namespace App\Modules\Admin\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Admin\Contracts\AdminAnalyticsServiceInterface;
use App\Modules\Admin\Http\Requests\AnalyticsTrendsRequest;
use App\Modules\Auth\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __construct(
        private readonly AdminAnalyticsServiceInterface $analytics,
    ) {}

    public function summary(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => $this->analytics->summary($user),
        ]);
    }

    public function trends(AnalyticsTrendsRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => $this->analytics->trends(
                $user,
                (int) ($request->validated('days') ?? 30)
            ),
        ]);
    }
}
