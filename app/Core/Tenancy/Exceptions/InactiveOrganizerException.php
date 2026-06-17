<?php

namespace App\Core\Tenancy\Exceptions;

class InactiveOrganizerException extends TenancyException
{
    protected string $errorCode = 'ORGANIZER_INACTIVE';

    public static function withStatus(string $status): self
    {
        return new self(
            "Organizer is not accessible (status: {$status}).",
            context: ['status' => $status]
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
