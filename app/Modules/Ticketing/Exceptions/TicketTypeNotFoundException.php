<?php

namespace App\Modules\Ticketing\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class TicketTypeNotFoundException extends TicketingException
{
    protected $statusCode = Response::HTTP_NOT_FOUND;

    protected $errorCode = 'TICKET_TYPE_NOT_FOUND';

    public static function make(): self
    {
        return new self('Ticket type not found.');
    }
}
