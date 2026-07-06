<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Event\Contracts\EventServiceInterface;
use App\Modules\Event\Http\Resources\EventResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function __construct(
        private readonly EventServiceInterface $eventService,
    ) {}

    public function indexPublic(Request $request): JsonResponse
    {
        $paginator = $this->eventService->listPublic($request->only([
            'search',
            'category_id',
            'city',
            'is_free',
            'upcoming_days',
            'sort',
            'per_page',
            'page',
        ]));

        return EventResource::collection($paginator)->response();
    }

    public function showPublic(string $uuid): JsonResponse
    {
        return response()->json([
            'data' => new EventResource($this->eventService->showPublic($uuid)),
        ]);
    }
}
