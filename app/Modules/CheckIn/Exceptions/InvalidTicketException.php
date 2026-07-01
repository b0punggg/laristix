<?php

namespace App\Modules\CheckIn\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class InvalidTicketException extends CheckInException
{
    protected $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;

    protected $errorCode = 'INVALID_TICKET';

    public static function invalid(string $message): self
    {
        return new self($message);
    }
}
