<?php

namespace App\Modules\Order\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class CheckoutException extends DomainException
{
    protected $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;

    protected $errorCode = 'CHECKOUT_ERROR';

    public static function make(string $message, int $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY): self
    {
        $exception = new self($message);
        $exception->statusCode = $statusCode;

        return $exception;
    }
}
