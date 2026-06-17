<?php

namespace App\Modules\Auth\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class AuthException extends DomainException
{
    protected int $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;

    protected string $errorCode = 'AUTH_ERROR';
}
