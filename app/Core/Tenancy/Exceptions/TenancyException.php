<?php

namespace App\Core\Tenancy\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class TenancyException extends DomainException
{
    protected int $statusCode = Response::HTTP_FORBIDDEN;

    protected string $errorCode = 'TENANCY_ERROR';
}
