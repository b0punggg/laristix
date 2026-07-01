<?php

namespace App\Modules\Order\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class OrderNotFoundException extends DomainException
{
    protected $statusCode = Response::HTTP_NOT_FOUND;

    protected $errorCode = 'ORDER_NOT_FOUND';

    public static function make(): self
    {
        return new self('Order not found.');
    }
}
