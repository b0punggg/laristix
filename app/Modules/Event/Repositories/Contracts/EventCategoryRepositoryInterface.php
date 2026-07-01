<?php

namespace App\Modules\Event\Repositories\Contracts;

use App\Modules\Event\Models\EventCategory;
use Illuminate\Support\Collection;

interface EventCategoryRepositoryInterface
{
    /**
     * @return Collection<int, EventCategory>
     */
    public function listAvailableForOrganizer(?int $organizerId): Collection;

    public function findForOrganizer(?int $organizerId, int $categoryId): ?EventCategory;
}
