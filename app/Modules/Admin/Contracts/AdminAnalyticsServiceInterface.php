<?php

namespace App\Modules\Admin\Contracts;

use App\Modules\Auth\Models\User;

interface AdminAnalyticsServiceInterface
{
    public function summary(User $admin): array;

    public function trends(User $admin, int $days = 30): array;
}
