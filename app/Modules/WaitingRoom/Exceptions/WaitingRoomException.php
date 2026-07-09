<?php

namespace App\Modules\WaitingRoom\Exceptions;

use App\Core\Exceptions\DomainException;
use Symfony\Component\HttpFoundation\Response;

class WaitingRoomException extends DomainException
{
    protected $statusCode = Response::HTTP_FORBIDDEN;

    protected $errorCode = 'WAITING_ROOM_REQUIRED';

    /** @var array<string, mixed> */
    protected array $exceptionContext = [];

    /**
     * @param  array<string, mixed>  $context
     */
    public static function queueRequired(string $message = 'Waiting room admission is required.', array $context = []): self
    {
        $exception = new self($message);
        $exception->exceptionContext = $context;

        return $exception;
    }

    public static function invalidSession(string $message = 'Queue session is invalid or expired.'): self
    {
        $exception = new self($message);
        $exception->errorCode = 'WAITING_ROOM_INVALID_SESSION';
        $exception->statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;

        return $exception;
    }

    /**
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return $this->exceptionContext;
    }
}
