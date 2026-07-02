<?php

namespace App\Modules\Admin\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Admin\Contracts\AuditLogServiceInterface;
use App\Modules\Admin\Http\Requests\ListAuditLogsRequest;
use App\Modules\Admin\Http\Resources\AuditLogResource;
use App\Modules\Auth\Models\User;
use Illuminate\Http\JsonResponse;

class AdminAuditLogController extends Controller
{
    public function __construct(
        private readonly AuditLogServiceInterface $auditLogs,
    ) {}

    public function index(ListAuditLogsRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $paginator = $this->auditLogs->listForAdmin(
            $user,
            $request->validated(),
            (int) ($request->validated('per_page') ?? 20)
        );

        return AuditLogResource::collection($paginator)->response();
    }
}
