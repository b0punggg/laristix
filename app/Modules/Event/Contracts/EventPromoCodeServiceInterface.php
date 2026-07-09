<?php

namespace App\Modules\Event\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;

interface EventPromoCodeServiceInterface
{
    /**
     * @return list<array<string, mixed>>
     */
    public function list(Event $event, Organizer $organizer, User $user): array;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function store(Event $event, Organizer $organizer, User $user, array $data): array;
}
