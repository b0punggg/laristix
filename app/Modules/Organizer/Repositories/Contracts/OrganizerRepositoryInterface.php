<?php

namespace App\Modules\Organizer\Repositories\Contracts;

use App\Modules\Organizer\Models\Organizer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface OrganizerRepositoryInterface
{
    public function findById(int $id): ?Organizer;

    public function findByUuid(string $uuid): ?Organizer;

    public function create(array $attributes): Organizer;

    public function update(Organizer $organizer, array $attributes): Organizer;

    public function slugExists(string $slug, ?int $exceptId = null): bool;

    /**
     * @return Collection<int, Organizer>
     */
    public function listForUser(int $userId): Collection;

    /**
     * @return Collection<int, Organizer>
     */
    public function listPending(): Collection;

    public function paginateForPlatform(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function findByUuidForAdmin(string $uuid): ?Organizer;
}
