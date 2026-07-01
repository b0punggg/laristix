<?php

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\Models\User;
use Laravel\Sanctum\NewAccessToken;

interface PersonalAccessTokenServiceInterface
{
    /**
     * @param  list<string>  $abilities
     */
    public function createToken(
        User $user,
        string $name,
        array $abilities,
        ?\DateTimeInterface $expiresAt = null
    ): NewAccessToken;

    public function createScannerToken(User $user, string $deviceName): NewAccessToken;

    public function revokeCurrentToken(User $user): void;

    public function revokeAllTokens(User $user): void;
}
