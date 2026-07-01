<?php

namespace App\Modules\Payment\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class PaymentException extends DomainException
{
    protected $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;

    protected $errorCode = 'PAYMENT_ERROR';

    public static function make(string $message, int $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY): self
    {
        $exception = new self($message);
        $exception->statusCode = $statusCode;

        return $exception;
    }
}
