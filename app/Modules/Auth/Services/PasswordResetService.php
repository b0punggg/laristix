<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Contracts\PasswordResetServiceInterface;
use App\Modules\Auth\DTOs\ForgotPasswordDto;
use App\Modules\Auth\DTOs\ResetPasswordDto;
use App\Modules\Auth\Notifications\ResetPasswordNotification;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetService implements PasswordResetServiceInterface
{
    /** @var UserRepositoryInterface */
    private $users;

    public function __construct(UserRepositoryInterface $users)
    {
        $this->users = $users;
    }

    public function sendResetLink(ForgotPasswordDto $dto): string
    {
        return Password::broker(config('auth_module.password_reset.broker', 'users'))
            ->sendResetLink(
                ['email' => $dto->email],
                function ($user, string $token) {
                    $user->notify(new ResetPasswordNotification($token));
                }
            );
    }

    public function resetPassword(ResetPasswordDto $dto): string
    {
        return Password::broker(config('auth_module.password_reset.broker', 'users'))
            ->reset(
                [
                    'email' => $dto->email,
                    'password' => $dto->password,
                    'password_confirmation' => $dto->passwordConfirmation,
                    'token' => $dto->token,
                ],
                function ($user, string $password) {
                    $this->users->update($user, [
                        'password' => $password,
                        'remember_token' => Str::random(60),
                    ]);
                }
            );
    }
}
