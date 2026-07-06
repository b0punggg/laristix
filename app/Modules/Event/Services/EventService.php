<?php

namespace App\Modules\Event\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventServiceInterface;
use App\Modules\Event\DTOs\CreateEventDto;
use App\Modules\Event\DTOs\UpdateEventDto;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Exceptions\EventAccessDeniedException;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Repositories\Contracts\EventCategoryRepositoryInterface;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use App\Modules\Event\Repositories\Contracts\VenueRepositoryInterface;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class EventService implements EventServiceInterface
{
    /** @var EventRepositoryInterface */
    private $events;

    /** @var VenueRepositoryInterface */
    private $venues;

    /** @var EventCategoryRepositoryInterface */
    private $categories;

    /** @var OrganizerMemberRepositoryInterface */
    private $members;

    public function __construct(
        EventRepositoryInterface $events,
        VenueRepositoryInterface $venues,
        EventCategoryRepositoryInterface $categories,
        OrganizerMemberRepositoryInterface $members
    ) {
        $this->events = $events;
        $this->venues = $venues;
        $this->categories = $categories;
        $this->members = $members;
    }

    public function create(Organizer $organizer, User $user, CreateEventDto $dto): Event
    {
        $this->assertCanManage($organizer, $user);
        $this->assertVenueBelongsToOrganizer($organizer->id, $dto->venueId);
        $this->assertCategoryAvailable($organizer->id, $dto->categoryId);

        $slug = $this->resolveSlug($organizer->id, $dto->title, $dto->slug);

        return $this->events->create([
            'organizer_id' => $organizer->id,
            'venue_id' => $dto->venueId,
            'category_id' => $dto->categoryId,
            'created_by' => $user->id,
            'title' => $dto->title,
            'slug' => $slug,
            'description' => $dto->description,
            'short_description' => $dto->shortDescription,
            'status' => EventStatus::DRAFT,
            'visibility' => $dto->visibility,
            'start_at' => $dto->startAt,
            'end_at' => $dto->endAt,
            'timezone' => $dto->timezone,
            'capacity' => $dto->capacity,
            'is_free' => $dto->isFree,
        ]);
    }

    public function update(Event $event, User $user, UpdateEventDto $dto): Event
    {
        $this->assertCanManage($event->organizer, $user);
        $this->assertVenueBelongsToOrganizer($event->organizer_id, $dto->venueId);
        $this->assertCategoryAvailable($event->organizer_id, $dto->categoryId);

        if ($event->status !== EventStatus::DRAFT && $event->status !== EventStatus::PUBLISHED) {
            throw EventAccessDeniedException::make('Only draft or published events can be edited.');
        }

        return $this->events->update($event, $dto->toArray());
    }

    public function delete(Event $event, User $user): void
    {
        $this->assertCanManage($event->organizer, $user);

        if (! in_array($event->status, [EventStatus::DRAFT, EventStatus::PUBLISHED], true)) {
            throw EventAccessDeniedException::make('Only draft or published events can be deleted.');
        }

        $this->events->delete($event);
    }

    public function show(Event $event, User $user): Event
    {
        $this->assertCanView($event->organizer, $user);

        return $event->load(['venue', 'category', 'createdBy', 'schedules', 'media']);
    }

    public function publish(Event $event, User $user): Event
    {
        $this->assertCanManage($event->organizer, $user);

        if ($event->status !== EventStatus::DRAFT) {
            throw EventAccessDeniedException::make('Only draft events can be published.');
        }

        $this->assertPublishable($event);

        return $this->events->markAsPublished($event);
    }

    public function draft(Event $event, User $user): Event
    {
        $this->assertCanManage($event->organizer, $user);

        if ($event->status !== EventStatus::PUBLISHED) {
            throw EventAccessDeniedException::make('Only published events can be reverted to draft.');
        }

        return $this->events->markAsDraft($event);
    }

    public function listForOrganizer(Organizer $organizer, User $user, array $filters = []): LengthAwarePaginator
    {
        $this->assertCanView($organizer, $user);

        return $this->events->paginateForOrganizer(
            $organizer->id,
            $filters,
            (int) config('event_module.pagination.per_page', 15)
        );
    }

    public function listForPlatform(User $user, array $filters = []): LengthAwarePaginator
    {
        if (! $user->isSuperAdmin()) {
            throw EventAccessDeniedException::make('Super admin access required.');
        }

        return $this->events->paginateForPlatform(
            $filters,
            (int) config('event_module.pagination.per_page', 15)
        );
    }

    public function listPublic(array $filters = []): LengthAwarePaginator
    {
        $perPage = isset($filters['per_page'])
            ? max(1, min((int) $filters['per_page'], 48))
            : (int) config('event_module.pagination.public_per_page', 12);

        return $this->events->paginatePublic(
            \Illuminate\Support\Arr::except($filters, ['per_page']),
            $perPage
        );
    }

    public function showPublic(string $uuid): Event
    {
        $event = $this->events->findPublicByUuid($uuid);

        if ($event === null) {
            throw EventNotFoundException::make();
        }

        return $event;
    }

    public function listPublicCategories()
    {
        return $this->categories->listPublicWithEventCounts();
    }

    public function listPublicCities()
    {
        return $this->events->listPublicCities();
    }

    public function publicPlatformStats(): array
    {
        return [
            'published_events_count' => $this->events->countPublicPublished(),
            'organizer_count' => $this->events->countPublicOrganizers(),
        ];
    }

    public function listFeaturedOrganizers(int $limit = 8)
    {
        return $this->events->listFeaturedOrganizers($limit);
    }

    private function assertPublishable(Event $event): void
    {
        if (trim($event->title) === '') {
            throw EventAccessDeniedException::make('Event title is required before publishing.');
        }

        if ($event->start_at === null || $event->end_at === null) {
            throw EventAccessDeniedException::make('Event schedule is required before publishing.');
        }

        if ($event->end_at->isPast()) {
            throw EventAccessDeniedException::make('Cannot publish an event that has already ended.');
        }

        if (trim($event->timezone) === '') {
            throw EventAccessDeniedException::make('Event timezone is required before publishing.');
        }
    }

    private function resolveSlug(int $organizerId, string $title, ?string $slug): string
    {
        $base = Str::slug($slug ?: $title);

        if ($base === '') {
            $base = 'event';
        }

        $candidate = $base;
        $suffix = 1;

        while ($this->events->slugExists($organizerId, $candidate)) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    private function assertVenueBelongsToOrganizer(int $organizerId, ?int $venueId): void
    {
        if ($venueId === null) {
            return;
        }

        if ($this->venues->findForOrganizer($organizerId, $venueId) === null) {
            throw EventAccessDeniedException::make('Venue does not belong to this organizer.');
        }
    }

    private function assertCategoryAvailable(int $organizerId, ?int $categoryId): void
    {
        if ($categoryId === null) {
            return;
        }

        if ($this->categories->findForOrganizer($organizerId, $categoryId) === null) {
            throw EventAccessDeniedException::make('Category is not available for this organizer.');
        }
    }

    private function assertCanManage(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null || ! in_array($membership->role, OrganizerMemberRole::managers(), true)) {
            throw EventAccessDeniedException::make();
        }
    }

    private function assertCanView(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null) {
            throw EventAccessDeniedException::make();
        }
    }
}
