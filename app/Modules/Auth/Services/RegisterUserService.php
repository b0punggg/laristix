<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Contracts\EmailVerificationServiceInterface;
use App\Modules\Auth\Contracts\RegisterUserServiceInterface;
use App\Modules\Auth\Contracts\RoleServiceInterface;
use App\Modules\Auth\DTOs\RegisterUserDto;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;

class RegisterUserService implements RegisterUserServiceInterface
{
    /** @var UserRepositoryInterface */
    private $users;

    /** @var EmailVerificationServiceInterface */
    private $emailVerification;

    /** @var RoleServiceInterface */
    private $roleService;

    public function __construct(
        UserRepositoryInterface $users,
        EmailVerificationServiceInterface $emailVerification,
        RoleServiceInterface $roleService
    ) {
        $this->users = $users;
        $this->emailVerification = $emailVerification;
        $this->roleService = $roleService;
    }

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

            $this->roleService->assignDefaultRoleOnRegister($user);

            if (config('auth_module.require_email_verification', true)) {
                $this->emailVerification->sendVerificationNotification($user);
            }

            return $user;
        });
    }
}
