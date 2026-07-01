<?php

namespace App\Modules\Event\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class EventNotFoundException extends EventException
{
    protected $statusCode = Response::HTTP_NOT_FOUND;

    protected $errorCode = 'EVENT_NOT_FOUND';

    public static function make(): self
    {
        return new self('Event not found.');
    }
}
