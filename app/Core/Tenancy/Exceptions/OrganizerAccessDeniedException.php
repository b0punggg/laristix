<?php

namespace App\Core\Tenancy\Exceptions;

class OrganizerAccessDeniedException extends TenancyException
{
    protected string $errorCode = 'ORGANIZER_ACCESS_DENIED';

    public static function make(?string $reason = null): self
    {
        $message = 'Access to this organizer is denied.';

        if ($reason !== null) {
            $message .= ' '.$reason;
        }

        return new self($message);
    }
}
