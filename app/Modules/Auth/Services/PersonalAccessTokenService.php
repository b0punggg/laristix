<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Contracts\PersonalAccessTokenServiceInterface;
use App\Modules\Auth\Models\User;
use Laravel\Sanctum\NewAccessToken;

class PersonalAccessTokenService implements PersonalAccessTokenServiceInterface
{
    public function createToken(
        User $user,
        string $name,
        array $abilities,
        ?\DateTimeInterface $expiresAt = null
    ): NewAccessToken {
        return $user->createToken($name, $abilities, $expiresAt);
    }

    public function createScannerToken(User $user, string $deviceName): NewAccessToken
    {
        $expiresAt = now()->addDays((int) config('auth_module.token.default_expiry_days', 90));

        return $this->createToken(
            $user,
            config('auth_module.token.scanner_token_name', 'scanner').':'.$deviceName,
            config('auth_module.token.scanner_abilities', ['check-in:scan', 'check-in:read']),
            $expiresAt
        );
    }

    public function revokeCurrentToken(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token !== null) {
            $token->delete();
        }
    }

    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
    }
}
