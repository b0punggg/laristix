<?php

namespace App\Modules\Organizer\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class OrganizerException extends DomainException
{
}

class OrganizerNotFoundException extends OrganizerException
{
    protected $statusCode = Response::HTTP_NOT_FOUND;

    protected $errorCode = 'ORGANIZER_NOT_FOUND';

    public static function make(): self
    {
        return new self('Organizer not found.');
    }
}

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

class OrganizerSlugTakenException extends OrganizerException
{
    protected $errorCode = 'ORGANIZER_SLUG_TAKEN';

    public static function make(string $slug): self
    {
        return new self("The slug \"{$slug}\" is already taken.");
    }
}
