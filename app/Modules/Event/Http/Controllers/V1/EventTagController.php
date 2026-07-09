<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Event\Exceptions\EventAccessDeniedException;
use App\Modules\Event\Http\Requests\StoreEventTagRequest;
use App\Modules\Event\Http\Resources\EventTagResource;
use App\Modules\Event\Repositories\Contracts\EventTagRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventTagController extends Controller
{
    public function __construct(
        private readonly EventTagRepositoryInterface $tags,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $organizer = $this->requireOrganizer();

        return response()->json([
            'data' => EventTagResource::collection(
                $this->tags->listAvailableForOrganizer($organizer->id)
            ),
        ]);
    }

    public function store(StoreEventTagRequest $request): JsonResponse
    {
        $organizer = $this->requireOrganizer();
        $name = $request->validated('name');
        $slug = $this->resolveSlug($organizer->id, $name, $request->validated('slug'));

        $tag = $this->tags->create([
            'organizer_id' => $organizer->id,
            'name' => $name,
            'slug' => $slug,
        ]);

        return response()->json([
            'message' => 'Tag created successfully.',
            'data' => new EventTagResource($tag),
        ], 201);
    }

    private function resolveSlug(int $organizerId, string $name, ?string $slug): string
    {
        $base = Str::slug($slug ?: $name) ?: 'tag';
        $candidate = $base;
        $suffix = 1;

        while ($this->tags->slugExists($organizerId, $candidate)) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    private function requireOrganizer()
    {
        $organizer = $this->organizerContext->organizer();

        if ($organizer === null) {
            throw EventAccessDeniedException::make();
        }

        return $organizer;
    }
}
