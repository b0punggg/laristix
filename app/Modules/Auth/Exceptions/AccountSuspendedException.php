<?php

namespace App\Modules\Auth\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class AccountSuspendedException extends AuthException
{
    protected $statusCode = Response::HTTP_FORBIDDEN;

    protected $errorCode = 'ACCOUNT_SUSPENDED';

    public static function make(): self
    {
        return new self('This account has been suspended.');
    }
}
