<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Http\Resources\EventCategoryResource;
use App\Modules\Event\Repositories\Contracts\EventCategoryRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventCategoryController extends Controller
{
    public function __construct(
        private readonly EventCategoryRepositoryInterface $categories,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $organizer = $this->organizerContext->organizer();

        return response()->json([
            'data' => EventCategoryResource::collection(
                $this->categories->listAvailableForOrganizer($organizer?->id)
            ),
        ]);
    }

    public function indexAuthenticated(Request $request): JsonResponse
    {
        $organizer = $this->requireOrganizer();

        return response()->json([
            'data' => EventCategoryResource::collection(
                $this->categories->listAvailableForOrganizer($organizer->id)
            ),
        ]);
    }

    private function requireOrganizer()
    {
        $organizer = $this->organizerContext->organizer();

        if ($organizer === null) {
            throw EventNotFoundException::make();
        }

        return $organizer;
    }
}
