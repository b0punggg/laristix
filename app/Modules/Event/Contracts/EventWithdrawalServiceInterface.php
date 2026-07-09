<?php

namespace App\Modules\Event\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;

interface EventWithdrawalServiceInterface
{
    /**
     * @return array{
     *   available_balance: float,
     *   pending_balance: float,
     *   withdrawn_total: float,
     *   data: list<array<string, mixed>>
     * }
     */
    public function list(Event $event, Organizer $organizer, User $user): array;

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function create(Event $event, Organizer $organizer, User $user, array $payload): array;
}
