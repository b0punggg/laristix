<?php

namespace App\Modules\Event\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface EventAttendeeServiceInterface
{
    /**
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginate(
        Event $event,
        Organizer $organizer,
        User $user,
        ?string $search = null,
        ?string $orderStatus = null,
        int $perPage = 25,
    ): LengthAwarePaginator;

    /**
     * @return array<string, mixed>
     */
    public function showOrder(Event $event, Organizer $organizer, User $user, string $orderUuid): array;
}
