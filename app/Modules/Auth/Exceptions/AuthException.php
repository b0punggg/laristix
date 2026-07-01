<?php

namespace App\Modules\Auth\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class AuthException extends DomainException
{
    protected $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;

    protected $errorCode = 'AUTH_ERROR';
}
