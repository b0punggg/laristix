<?php

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\DTOs\AuthenticatedUserDto;
use App\Modules\Auth\DTOs\LoginDto;
use App\Modules\Auth\Models\User;

interface AuthServiceInterface
{
    public function login(LoginDto $dto): User;

    public function logout(User $user): void;

    public function currentUser(User $user): AuthenticatedUserDto;
}
