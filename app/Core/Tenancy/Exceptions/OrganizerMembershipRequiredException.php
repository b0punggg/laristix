<?php

namespace App\Core\Tenancy\Exceptions;

class OrganizerMembershipRequiredException extends TenancyException
{
    protected string $errorCode = 'ORGANIZER_MEMBERSHIP_REQUIRED';

    public static function forUserAndOrganizer(int $userId, int $organizerId): self
    {
        return new self(
            'You do not have an active membership for this organizer.',
            context: [
                'user_id' => $userId,
                'organizer_id' => $organizerId,
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public function __construct(
        string $message = '',
        int $code = 0,
        ?\Throwable $previous = null,
        protected array $context = [],
    ) {
        parent::__construct($message, $code, $previous);
    }

    public function context(): array
    {
        return $this->context;
    }
}
