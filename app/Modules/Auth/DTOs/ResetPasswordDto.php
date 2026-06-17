<?php

namespace App\Modules\Auth\DTOs;

readonly class ResetPasswordDto
{
    public function __construct(
        public string $email,
        public string $password,
        public string $passwordConfirmation,
        public string $token,
    ) {}
}
