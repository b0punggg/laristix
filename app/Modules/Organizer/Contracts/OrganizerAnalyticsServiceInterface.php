<?php

namespace App\Modules\Organizer\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;

interface OrganizerAnalyticsServiceInterface
{
    /**
     * @return array<string, mixed>
     */
    public function summary(Organizer $organizer, User $user): array;

    /**
     * @return array<string, mixed>
     */
    public function trends(Organizer $organizer, User $user, int $days = 30): array;

    /**
     * @return array<string, mixed>
     */
    public function insights(Organizer $organizer, User $user): array;

    /**
     * @return array<string, mixed>
     */
    public function scannerSummary(Organizer $organizer, User $user): array;
}
