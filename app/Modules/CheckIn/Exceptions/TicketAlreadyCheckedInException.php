<?php

namespace App\Modules\CheckIn\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class TicketAlreadyCheckedInException extends CheckInException
{
    protected $statusCode = Response::HTTP_CONFLICT;

    protected $errorCode = 'TICKET_ALREADY_CHECKED_IN';

    public static function alreadyCheckedIn(string $message = 'This ticket has already been checked in.'): self
    {
        return new self($message);
    }
}
