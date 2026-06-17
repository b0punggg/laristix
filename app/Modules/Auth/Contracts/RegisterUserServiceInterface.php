<?php

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\DTOs\RegisterUserDto;
use App\Modules\Auth\Models\User;

interface RegisterUserServiceInterface
{
    public function register(RegisterUserDto $dto): User;
}
