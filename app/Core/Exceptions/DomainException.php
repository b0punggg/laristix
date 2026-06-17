<?php

namespace App\Core\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

abstract class DomainException extends Exception
{
    protected int $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;

    protected string $errorCode = 'DOMAIN_ERROR';

    public function statusCode(): int
    {
        return $this->statusCode;
    }

    public function errorCode(): string
    {
        return $this->errorCode;
    }

    /**
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return [];
    }
}
