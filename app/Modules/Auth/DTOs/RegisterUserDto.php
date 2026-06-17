<?php

namespace App\Modules\Auth\DTOs;

readonly class RegisterUserDto
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public ?string $phone = null,
    ) {}
}
