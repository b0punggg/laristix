<?php

namespace App\Modules\Organizer\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\DTOs\UpdateOrganizerDto;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface OrganizerServiceInterface
{
    public function show(Organizer $organizer, User $user): Organizer;

    public function update(Organizer $organizer, User $user, UpdateOrganizerDto $dto): Organizer;

    public function approve(Organizer $organizer, User $admin): Organizer;

    /**
     * @return Collection<int, Organizer>
     */
    public function listPending(User $admin): Collection;

    public function listForPlatform(User $admin, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function showForPlatform(User $admin, Organizer $organizer): Organizer;

    public function suspend(Organizer $organizer, User $admin): Organizer;

    public function activate(Organizer $organizer, User $admin): Organizer;

    public function reject(Organizer $organizer, User $admin): Organizer;
}
