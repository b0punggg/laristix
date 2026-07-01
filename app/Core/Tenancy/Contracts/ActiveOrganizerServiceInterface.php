<?php

namespace App\Core\Tenancy\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Support\Collection;

interface ActiveOrganizerServiceInterface
{
    public function sessionKey(): string;

    public function getActiveOrganizerId(User $user): ?int;

    public function getAvailableOrganizers(User $user): Collection;

    public function switch(User $user, int $organizerId): Organizer;

    public function clear(User $user): void;

    public function resolveOrganizerId(User $user, ?int $requestedOrganizerId = null): ?int;
}
