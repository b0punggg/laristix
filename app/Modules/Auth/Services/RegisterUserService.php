<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Contracts\EmailVerificationServiceInterface;
use App\Modules\Auth\Contracts\RegisterUserServiceInterface;
use App\Modules\Auth\DTOs\RegisterUserDto;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;

class RegisterUserService implements RegisterUserServiceInterface
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly EmailVerificationServiceInterface $emailVerification,
    ) {}

    public function register(RegisterUserDto $dto): User
    {
        return DB::transaction(function () use ($dto) {
            $user = $this->users->create([
                'name' => $dto->name,
                'email' => $dto->email,
                'password' => $dto->password,
                'phone' => $dto->phone,
                'platform_role' => 'user',
                'status' => 'active',
            ]);

            event(new Registered($user));

            if (config('auth_module.require_email_verification', true)) {
                $this->emailVerification->sendVerificationNotification($user);
            }

            return $user;
        });
    }
}
