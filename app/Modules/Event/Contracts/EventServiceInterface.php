<?php

namespace App\Modules\Event\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Event\DTOs\CreateEventDto;
use App\Modules\Event\DTOs\UpdateEventDto;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EventServiceInterface
{
    public function create(Organizer $organizer, User $user, CreateEventDto $dto): Event;

    public function update(Event $event, User $user, UpdateEventDto $dto): Event;

    public function delete(Event $event, User $user): void;

    public function show(Event $event, User $user): Event;

    public function publish(Event $event, User $user): Event;

    public function draft(Event $event, User $user): Event;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function listForOrganizer(Organizer $organizer, User $user, array $filters = []): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function listForPlatform(User $user, array $filters = []): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function listPublic(array $filters = []): LengthAwarePaginator;

    public function showPublic(string $uuid): Event;

    /**
     * @return \Illuminate\Support\Collection<int, \App\Modules\Event\Models\EventCategory>
     */
    public function listPublicCategories();

    /**
     * @return \Illuminate\Support\Collection<int, array{city: string, events_count: int}>
     */
    public function listPublicCities();

    /**
     * @return array{published_events_count: int, organizer_count: int}
     */
    public function publicPlatformStats(): array;

    /**
     * @return \Illuminate\Support\Collection<int, \App\Modules\Organizer\Models\Organizer>
     */
    public function listFeaturedOrganizers(int $limit = 8);
}
