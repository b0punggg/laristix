<?php

namespace App\Modules\Event\Exceptions;

class EventSlugTakenException extends EventException
{
    protected $errorCode = 'EVENT_SLUG_TAKEN';

    public static function make(string $slug): self
    {
        return new self("The slug \"{$slug}\" is already taken for this organizer.");
    }
}
