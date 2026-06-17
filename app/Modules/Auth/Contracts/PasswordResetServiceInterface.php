<?php

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\DTOs\ForgotPasswordDto;
use App\Modules\Auth\DTOs\ResetPasswordDto;

interface PasswordResetServiceInterface
{
    public function sendResetLink(ForgotPasswordDto $dto): string;

    public function resetPassword(ResetPasswordDto $dto): string;
}
