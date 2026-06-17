<?php

namespace App\Modules\Auth\DTOs;

readonly class LoginDto
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember = false,
    ) {}
}
