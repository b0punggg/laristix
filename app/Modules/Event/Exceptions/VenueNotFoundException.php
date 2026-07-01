<?php

namespace App\Modules\Event\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class VenueNotFoundException extends EventException
{
    protected $statusCode = Response::HTTP_NOT_FOUND;

    protected $errorCode = 'VENUE_NOT_FOUND';

    public static function make(): self
    {
        return new self('Venue not found.');
    }
}
