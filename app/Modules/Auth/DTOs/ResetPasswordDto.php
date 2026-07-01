<?php

namespace App\Modules\Auth\DTOs;

class ResetPasswordDto
{
    /** @var string */
    public $email;

    /** @var string */
    public $password;

    /** @var string */
    public $passwordConfirmation;

    /** @var string */
    public $token;

    public function __construct(string $email, string $password, string $passwordConfirmation, string $token)
    {
        $this->email = $email;
        $this->password = $password;
        $this->passwordConfirmation = $passwordConfirmation;
        $this->token = $token;
    }
}
