<?php

namespace App\Core\Tenancy\Exceptions;

class OrganizerContextRequiredException extends TenancyException
{
    protected $statusCode = 401;

    protected $errorCode = 'ORGANIZER_CONTEXT_REQUIRED';

    public static function make(): self
    {
        return new self('An active organizer context is required for this action.');
    }
}
