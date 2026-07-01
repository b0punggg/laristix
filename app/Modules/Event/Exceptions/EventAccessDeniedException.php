<?php

namespace App\Modules\Event\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class EventAccessDeniedException extends EventException
{
    protected $statusCode = Response::HTTP_FORBIDDEN;

    protected $errorCode = 'EVENT_ACCESS_DENIED';

    public static function make(?string $reason = null): self
    {
        return new self($reason ?? 'You do not have permission to manage this event.');
    }
}
