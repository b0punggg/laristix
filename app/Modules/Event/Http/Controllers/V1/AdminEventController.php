<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventServiceInterface;
use App\Modules\Event\Http\Requests\AdminListEventsRequest;
use App\Modules\Event\Http\Resources\EventResource;
use Illuminate\Http\JsonResponse;

class AdminEventController extends Controller
{
    public function __construct(
        private readonly EventServiceInterface $eventService,
    ) {}

    public function index(AdminListEventsRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $paginator = $this->eventService->listForPlatform($user, $request->validated());

        return EventResource::collection($paginator)->response();
    }
}
