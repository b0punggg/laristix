<?php

namespace App\Modules\Auth\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class EmailNotVerifiedException extends AuthException
{
    protected int $statusCode = Response::HTTP_FORBIDDEN;

    protected string $errorCode = 'EMAIL_NOT_VERIFIED';

    public static function make(): self
    {
        return new self('Please verify your email address before continuing.');
    }
}
