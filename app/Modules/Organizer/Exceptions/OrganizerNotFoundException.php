<?php

namespace App\Modules\Organizer\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class OrganizerNotFoundException extends OrganizerException
{
    protected $statusCode = Response::HTTP_NOT_FOUND;

    protected $errorCode = 'ORGANIZER_NOT_FOUND';

    public static function make(): self
    {
        return new self('Organizer not found.');
    }
}
