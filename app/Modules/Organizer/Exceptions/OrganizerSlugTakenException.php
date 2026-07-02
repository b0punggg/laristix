<?php

namespace App\Modules\Organizer\Exceptions;

class OrganizerSlugTakenException extends OrganizerException
{
    protected $errorCode = 'ORGANIZER_SLUG_TAKEN';

    public static function make(string $slug): self
    {
        return new self("The slug \"{$slug}\" is already taken.");
    }
}
