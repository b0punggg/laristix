<?php

namespace App\Modules\Auth\DTOs;

readonly class SwitchOrganizerDto
{
    public function __construct(
        public int $organizerId,
    ) {}
}
