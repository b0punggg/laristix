<?php

namespace App\Modules\Auth\Exceptions;

class InvalidCredentialsException extends AuthException
{
    protected $errorCode = 'INVALID_CREDENTIALS';

    public static function make(): self
    {
        return new self('These credentials do not match our records.');
    }
}
