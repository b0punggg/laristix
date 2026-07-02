<?php

namespace App\Modules\Organizer\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class OrganizerAccessDeniedException extends OrganizerException
{
    protected $statusCode = Response::HTTP_FORBIDDEN;

    protected $errorCode = 'ORGANIZER_ACCESS_DENIED';

    public static function make(?string $reason = null): self
    {
        $message = 'You do not have permission to perform this action on this organizer.';

        if ($reason !== null) {
            $message = $reason;
        }

        return new self($message);
    }
}
