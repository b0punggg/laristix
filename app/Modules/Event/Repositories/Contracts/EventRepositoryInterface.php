<?php

namespace App\Modules\Event\Repositories\Contracts;

use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface EventRepositoryInterface
{
    public function findById(int $id): ?Event;

    public function findByUuid(string $uuid): ?Event;

    public function findByUuidForOrganizer(string $uuid, int $organizerId): ?Event;

    public function create(array $attributes): Event;

    public function update(Event $event, array $attributes): Event;

    public function delete(Event $event): void;

    public function markAsPublished(Event $event): Event;

    public function markAsDraft(Event $event): Event;

    public function slugExists(int $organizerId, string $slug, ?int $exceptId = null): bool;

    public function paginateForOrganizer(int $organizerId, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateForPlatform(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function paginatePublic(array $filters = [], int $perPage = 12): LengthAwarePaginator;

    public function findPublicByUuid(string $uuid): ?Event;

    /**
     * @return Collection<int, array{city: string, events_count: int}>
     */
    public function listPublicCities(): Collection;

    public function countPublicPublished(): int;

    public function countPublicOrganizers(): int;

    /**
     * @return Collection<int, \App\Modules\Organizer\Models\Organizer>
     */
    public function listFeaturedOrganizers(int $limit = 8): Collection;

    public function findPublicOrganizerBySlug(string $slug): ?Organizer;
}
