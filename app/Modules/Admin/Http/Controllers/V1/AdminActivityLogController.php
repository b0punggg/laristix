<?php

namespace App\Modules\Admin\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Admin\Contracts\ActivityLogServiceInterface;
use App\Modules\Admin\Http\Requests\ListActivityLogsRequest;
use App\Modules\Admin\Http\Resources\ActivityLogResource;
use App\Modules\Auth\Models\User;
use Illuminate\Http\JsonResponse;

class AdminActivityLogController extends Controller
{
    public function __construct(
        private readonly ActivityLogServiceInterface $activityLogs,
    ) {}

    public function index(ListActivityLogsRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $paginator = $this->activityLogs->listForAdmin(
            $user,
            $request->validated(),
            (int) ($request->validated('per_page') ?? 20)
        );

        return ActivityLogResource::collection($paginator)->response();
    }
}
