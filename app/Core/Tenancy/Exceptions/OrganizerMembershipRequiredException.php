<?php

namespace App\Core\Tenancy\Exceptions;

class OrganizerMembershipRequiredException extends TenancyException
{
    protected $errorCode = 'ORGANIZER_MEMBERSHIP_REQUIRED';

    /** @var array<string, mixed> */
    protected $contextData = [];

    public static function forUserAndOrganizer(int $userId, int $organizerId): self
    {
        $exception = new self('You do not have an active membership for this organizer.');
        $exception->contextData = [
            'user_id' => $userId,
            'organizer_id' => $organizerId,
        ];

        return $exception;
    }

    public function context(): array
    {
        return $this->contextData;
    }
}
