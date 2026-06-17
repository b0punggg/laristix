<?php

namespace App\Modules\Auth\DTOs;

readonly class ForgotPasswordDto
{
    public function __construct(
        public string $email,
    ) {}
}
