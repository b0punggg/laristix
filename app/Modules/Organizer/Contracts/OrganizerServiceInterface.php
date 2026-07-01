<?php

namespace App\Modules\Organizer\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\DTOs\UpdateOrganizerDto;
use App\Modules\Organizer\Models\Organizer;
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
}
