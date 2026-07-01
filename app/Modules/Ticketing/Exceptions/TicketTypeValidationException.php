<?php

namespace App\Modules\Ticketing\Exceptions;

class TicketTypeValidationException extends TicketingException
{
    protected $errorCode = 'TICKET_TYPE_VALIDATION';

    public static function make(string $reason): self
    {
        return new self($reason);
    }
}
