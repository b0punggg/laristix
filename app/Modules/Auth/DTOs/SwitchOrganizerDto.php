<?php

namespace App\Modules\Auth\DTOs;

class SwitchOrganizerDto
{
    /** @var int */
    public $organizerId;

    public function __construct(int $organizerId)
    {
        $this->organizerId = $organizerId;
    }
}
