<?php

namespace App\Modules\WaitingRoom\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Auth\Models\User;
use App\Modules\WaitingRoom\Contracts\WaitingRoomMonitoringServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminWaitingRoomController extends Controller
{
    public function __construct(
        private readonly WaitingRoomMonitoringServiceInterface $monitoring,
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->monitoring->assertSuperAdmin($user);

        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'active_only' => ['sometimes', 'boolean'],
        ]);

        $payload = $this->monitoring->listQueues(
            search: $validated['search'] ?? null,
            activeOnly: (bool) ($validated['active_only'] ?? false),
        );

        return response()->json(['data' => $payload]);
    }

    public function show(Request $request, string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->monitoring->assertSuperAdmin($user);

        return response()->json([
            'data' => $this->monitoring->showEvent($eventUuid),
        ]);
    }

    public function promote(Request $request, string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->monitoring->assertSuperAdmin($user);

        $promoted = $this->monitoring->promoteEvent($eventUuid);

        return response()->json([
            'message' => "Promoted {$promoted} waiting room session(s).",
            'data' => [
                'promoted_count' => $promoted,
            ],
        ]);
    }
}
