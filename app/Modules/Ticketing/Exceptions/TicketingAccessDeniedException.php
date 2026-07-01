<?php

namespace App\Modules\Ticketing\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class TicketingAccessDeniedException extends TicketingException
{
    protected $statusCode = Response::HTTP_FORBIDDEN;

    protected $errorCode = 'TICKETING_ACCESS_DENIED';

    public static function make(?string $reason = null): self
    {
        return new self($reason ?? 'You do not have permission to manage tickets for this event.');
    }
}
