<?php

namespace App\Modules\CheckIn\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class CheckInAccessDeniedException extends CheckInException
{
    protected $statusCode = Response::HTTP_FORBIDDEN;

    protected $errorCode = 'CHECK_IN_ACCESS_DENIED';

    public static function denied(string $message = 'You do not have permission to perform check-in for this event.'): self
    {
        return new self($message);
    }
}
