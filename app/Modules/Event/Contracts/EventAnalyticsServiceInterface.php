<?php

namespace App\Modules\Event\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;

interface EventAnalyticsServiceInterface
{
    /**
     * @return array<string, mixed>
     */
    public function summary(Event $event, Organizer $organizer, User $user): array;

    /**
     * @return array<string, mixed>
     */
    public function trends(Event $event, Organizer $organizer, User $user, int $days = 30): array;

    /**
     * @return array<string, mixed>
     */
    public function insights(Event $event, Organizer $organizer, User $user): array;
}
