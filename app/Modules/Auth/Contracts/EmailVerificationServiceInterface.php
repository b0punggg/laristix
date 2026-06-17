<?php

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\Models\User;

interface EmailVerificationServiceInterface
{
    public function sendVerificationNotification(User $user): void;

    public function markVerified(User $user, int $id, string $hash): void;
}
