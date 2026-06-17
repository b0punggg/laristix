<?php

namespace App\Core\Tenancy\Exceptions;

class OrganizerContextRequiredException extends TenancyException
{
    protected int $statusCode = 401;

    protected string $errorCode = 'ORGANIZER_CONTEXT_REQUIRED';

    public static function make(): self
    {
        return new self('An active organizer context is required for this action.');
    }
}
