<?php

namespace App\Modules\Auth\DTOs;

class ForgotPasswordDto
{
    /** @var string */
    public $email;

    public function __construct(string $email)
    {
        $this->email = $email;
    }
}
