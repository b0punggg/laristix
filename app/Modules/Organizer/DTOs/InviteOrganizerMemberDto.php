<?php

namespace App\Modules\Organizer\DTOs;

class InviteOrganizerMemberDto
{
    /** @var string */
    public $email;

    /** @var string */
    public $role;

    public function __construct(string $email, string $role)
    {
        $this->email = $email;
        $this->role = $role;
    }
}
