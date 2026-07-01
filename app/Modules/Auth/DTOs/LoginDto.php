<?php

namespace App\Modules\Auth\DTOs;

class LoginDto
{
    /** @var string */
    public $email;

    /** @var string */
    public $password;

    /** @var bool */
    public $remember;

    public function __construct(string $email, string $password, bool $remember = false)
    {
        $this->email = $email;
        $this->password = $password;
        $this->remember = $remember;
    }
}
