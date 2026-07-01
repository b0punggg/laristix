<?php

namespace App\Modules\CheckIn\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class CheckInException extends DomainException
{
    protected $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;

    protected $errorCode = 'CHECK_IN_ERROR';

    public static function make(string $message, int $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY): self
    {
        $exception = new self($message);
        $exception->statusCode = $statusCode;

        return $exception;
    }
}
