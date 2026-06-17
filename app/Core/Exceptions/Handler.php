<?php

namespace App\Core\Exceptions;

use App\Core\Exceptions\DomainException as CoreDomainException;
use App\Core\Tenancy\Exceptions\TenancyException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * @param  \Illuminate\Http\Request  $request
     */
    public function render($request, Throwable $e): JsonResponse|\Symfony\Component\HttpFoundation\Response
    {
        if ($request->expectsJson() && $e instanceof CoreDomainException) {
            return $this->renderDomainException($e);
        }

        return parent::render($request, $e);
    }

    private function renderDomainException(CoreDomainException $exception): JsonResponse
    {
        $payload = [
            'message' => $exception->getMessage(),
            'error_code' => $exception->errorCode(),
        ];

        $context = $exception->context();

        if ($context !== []) {
            $payload['context'] = $context;
        }

        if ($exception instanceof TenancyException) {
            $payload['message'] = $exception->getMessage();
        }

        return response()->json($payload, $exception->statusCode());
    }
}
