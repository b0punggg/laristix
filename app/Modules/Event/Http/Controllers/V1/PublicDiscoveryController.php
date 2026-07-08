<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Event\Contracts\EventServiceInterface;
use App\Modules\Event\Http\Resources\EventCategoryResource;
use App\Modules\Event\Http\Resources\FeaturedOrganizerResource;
use App\Modules\Event\Http\Resources\PublicCityResource;
use App\Modules\Event\Http\Resources\PublicCreatorResource;
use Illuminate\Http\JsonResponse;

class PublicDiscoveryController extends Controller
{
    public function __construct(
        private readonly EventServiceInterface $eventService,
    ) {}

    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => EventCategoryResource::collection(
                $this->eventService->listPublicCategories()
            ),
        ]);
    }

    public function cities(): JsonResponse
    {
        return response()->json([
            'data' => PublicCityResource::collection(
                $this->eventService->listPublicCities()
            ),
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => $this->eventService->publicPlatformStats(),
        ]);
    }

    public function featuredOrganizers(): JsonResponse
    {
        return response()->json([
            'data' => FeaturedOrganizerResource::collection(
                $this->eventService->listFeaturedOrganizers(8)
            ),
        ]);
    }

    public function showCreator(string $slug): JsonResponse
    {
        return response()->json([
            'data' => new PublicCreatorResource(
                $this->eventService->showPublicCreator($slug)
            ),
        ]);
    }
}
