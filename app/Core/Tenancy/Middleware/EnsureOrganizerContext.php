<?php

namespace App\Core\Tenancy\Middleware;

use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Core\Tenancy\Exceptions\OrganizerContextRequiredException;
use Closure;
use Illuminate\Http\Request;

class EnsureOrganizerContext
{
    /** @var OrganizerContextInterface */
    private $context;

    public function __construct(OrganizerContextInterface $context)
    {
        $this->context = $context;
    }

    public function handle(Request $request, Closure $next)
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
