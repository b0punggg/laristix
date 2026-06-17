<?php

namespace App\Core\Tenancy\Middleware;

use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Core\Tenancy\Exceptions\OrganizerContextRequiredException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizerContext
{
    public function __construct(
        private readonly OrganizerContextInterface $context,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null) {
            throw OrganizerContextRequiredException::make();
        }

        if (! $this->context->has()) {
            throw OrganizerContextRequiredException::make();
        }

        return $next($request);
    }
}
