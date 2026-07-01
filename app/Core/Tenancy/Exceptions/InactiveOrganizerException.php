<?php

namespace App\Core\Tenancy\Exceptions;

class InactiveOrganizerException extends TenancyException
{
    protected $errorCode = 'ORGANIZER_INACTIVE';

    /** @var array<string, mixed> */
    protected $contextData = [];

    public static function withStatus(string $status): self
    {
        $exception = new self("Organizer is not accessible (status: {$status}).");
        $exception->contextData = ['status' => $status];

        return $exception;
    }

    public function context(): array
    {
        return $this->contextData;
    }
}
