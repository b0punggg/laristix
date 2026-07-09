<?php

namespace App\Modules\Event\Repositories\Contracts;

use App\Modules\Event\Models\EventTag;
use Illuminate\Support\Collection;

interface EventTagRepositoryInterface
{
    public function listAvailableForOrganizer(?int $organizerId): Collection;

    public function findForOrganizer(?int $organizerId, int $tagId): ?EventTag;

    public function create(array $attributes): EventTag;

    public function slugExists(?int $organizerId, string $slug, ?int $exceptId = null): bool;
}
