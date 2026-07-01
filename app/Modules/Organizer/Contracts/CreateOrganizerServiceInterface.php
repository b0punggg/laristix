<?php

namespace App\Modules\Organizer\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\DTOs\CreateOrganizerDto;
use App\Modules\Organizer\Models\Organizer;

interface CreateOrganizerServiceInterface
{
    public function create(User $user, CreateOrganizerDto $dto): Organizer;
}
