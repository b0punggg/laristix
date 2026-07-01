<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventServiceInterface;
use App\Modules\Event\DTOs\CreateEventDto;
use App\Modules\Event\DTOs\UpdateEventDto;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Http\Requests\DraftEventRequest;
use App\Modules\Event\Http\Requests\ListEventsRequest;
use App\Modules\Event\Http\Requests\PublishEventRequest;
use App\Modules\Event\Http\Requests\StoreEventRequest;
use App\Modules\Event\Http\Requests\UpdateEventRequest;
use App\Modules\Event\Http\Resources\EventResource;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Http\JsonResponse;

class EventManagementController extends Controller
{
    public function __construct(
        private readonly EventServiceInterface $eventService,
        private readonly EventRepositoryInterface $events,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function index(ListEventsRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $paginator = $this->eventService->listForOrganizer(
            $this->requireOrganizer(),
            $user,
            $request->validated()
        );

        return EventResource::collection($paginator)->response();
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $event = $this->eventService->create($this->requireOrganizer(), $user, new CreateEventDto(
            title: $request->validated('title'),
            startAt: $request->validated('start_at'),
            endAt: $request->validated('end_at'),
            timezone: $request->validated('timezone'),
            slug: $request->validated('slug'),
            description: $request->validated('description'),
            shortDescription: $request->validated('short_description'),
            venueId: $request->validated('venue_id'),
            categoryId: $request->validated('category_id'),
            capacity: $request->validated('capacity'),
            isFree: $request->boolean('is_free'),
            visibility: $request->validated('visibility') ?? 'public',
        ));

        return response()->json([
            'message' => 'Event created as draft.',
            'data' => new EventResource($event->load(['venue', 'category', 'createdBy'])),
        ], 201);
    }

    public function show(string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();
        $organizer = $this->requireOrganizer();

        $event = $this->findEventOrFail($uuid, $organizer->id);

        return response()->json([
            'data' => new EventResource($this->eventService->show($event, $user)),
        ]);
    }

    public function update(UpdateEventRequest $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireOrganizer();

        $event = $this->findEventOrFail($uuid, $organizer->id);

        $updated = $this->eventService->update($event, $user, new UpdateEventDto(
            title: $request->validated('title'),
            description: $request->validated('description'),
            shortDescription: $request->validated('short_description'),
            bannerUrl: $request->validated('banner_url'),
            venueId: $request->validated('venue_id'),
            categoryId: $request->validated('category_id'),
            startAt: $request->validated('start_at'),
            endAt: $request->validated('end_at'),
            timezone: $request->validated('timezone'),
            capacity: $request->validated('capacity'),
            isFree: $request->has('is_free') ? $request->boolean('is_free') : null,
            visibility: $request->validated('visibility'),
            settings: $request->validated('settings'),
        ));

        return response()->json([
            'message' => 'Event updated successfully.',
            'data' => new EventResource($updated->load(['venue', 'category', 'createdBy'])),
        ]);
    }

    public function destroy(string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();
        $organizer = $this->requireOrganizer();

        $event = $this->findEventOrFail($uuid, $organizer->id);

        $this->eventService->delete($event, $user);

        return response()->json([
            'message' => 'Event deleted successfully.',
        ]);
    }

    public function publish(PublishEventRequest $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireOrganizer();

        $event = $this->findEventOrFail($uuid, $organizer->id);

        $published = $this->eventService->publish($event, $user);

        return response()->json([
            'message' => 'Event published successfully.',
            'data' => new EventResource($published->load(['venue', 'category', 'createdBy'])),
        ]);
    }

    public function draft(DraftEventRequest $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireOrganizer();

        $event = $this->findEventOrFail($uuid, $organizer->id);

        $draft = $this->eventService->draft($event, $user);

        return response()->json([
            'message' => 'Event reverted to draft.',
            'data' => new EventResource($draft->load(['venue', 'category', 'createdBy'])),
        ]);
    }

    private function findEventOrFail(string $uuid, int $organizerId)
    {
        $event = $this->events->findByUuidForOrganizer($uuid, $organizerId);

        if ($event === null) {
            throw EventNotFoundException::make();
        }

        return $event;
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
