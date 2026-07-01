<?php

namespace App\Modules\CheckIn\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class TicketNotFoundException extends CheckInException
{
    protected $statusCode = Response::HTTP_NOT_FOUND;

    protected $errorCode = 'TICKET_NOT_FOUND';

    public static function notFound(string $message = 'Ticket not found.'): self
    {
        return new self($message);
    }
}
