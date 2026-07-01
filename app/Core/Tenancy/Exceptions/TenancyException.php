<?php

namespace App\Core\Tenancy\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class TenancyException extends DomainException
{
    protected $statusCode = Response::HTTP_FORBIDDEN;

    protected $errorCode = 'TENANCY_ERROR';
}
