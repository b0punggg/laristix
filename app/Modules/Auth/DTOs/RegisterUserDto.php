<?php

namespace App\Modules\Auth\DTOs;

class RegisterUserDto
{
    /** @var string */
    public $name;

    /** @var string */
    public $email;

    /** @var string */
    public $password;

    /** @var string|null */
    public $phone;

    public function __construct(string $name, string $email, string $password, ?string $phone = null)
    {
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
        $this->phone = $phone;
    }
}
