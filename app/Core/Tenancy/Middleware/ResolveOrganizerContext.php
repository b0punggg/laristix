<?php

namespace App\Core\Tenancy\Middleware;

use App\Core\Tenancy\Contracts\ActiveOrganizerServiceInterface;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Core\Tenancy\Contracts\OrganizerMembershipValidatorInterface;
use App\Core\Tenancy\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use Closure;
use Illuminate\Http\Request;

class ResolveOrganizerContext
{
    /** @var OrganizerContextInterface */
    private $context;

    /** @var ActiveOrganizerServiceInterface */
    private $activeOrganizerService;

    /** @var OrganizerMembershipValidatorInterface */
    private $membershipValidator;

    public function __construct(
        OrganizerContextInterface $context,
        ActiveOrganizerServiceInterface $activeOrganizerService,
        OrganizerMembershipValidatorInterface $membershipValidator
    ) {
        $this->context = $context;
        $this->activeOrganizerService = $activeOrganizerService;
        $this->membershipValidator = $membershipValidator;
    }

    public function handle(Request $request, Closure $next)
    {
        $this->context->clear();

        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        if ($user->isSuperAdmin() && $this->shouldBypassForSuperAdmin($request)) {
            return $next($request);
        }

        $headerOrganizerId = $this->resolveHeaderOrganizerId($request);
        $organizerId = $this->activeOrganizerService->resolveOrganizerId($user, $headerOrganizerId);

        if ($organizerId === null) {
            return $next($request);
        }

        $membership = $this->membershipValidator->validateMembership($user, $organizerId);

        $organizer = Organizer::query()->find($organizerId);

        if ($organizer === null) {
            throw OrganizerAccessDeniedException::make('Organizer not found.');
        }

        $this->membershipValidator->validateOrganizerIsAccessible($organizer);

        $this->context->set($organizer, $user, $membership);

        return $next($request);
    }

    private function shouldBypassForSuperAdmin(Request $request): bool
    {
        $prefix = config('tenancy.super_admin_bypass_route_prefix', 'admin');

        return $request->is($prefix) || $request->is($prefix.'/*');
    }

    private function resolveHeaderOrganizerId(Request $request): ?int
    {
        if (! config('tenancy.header_hint_enabled', true)) {
            return null;
        }

        $header = config('tenancy.header_name', 'X-Organizer-Id');
        $value = $request->header($header);

        if ($value === null || $value === '') {
            return null;
        }

        if (! is_numeric($value)) {
            throw OrganizerAccessDeniedException::make('Invalid organizer identifier.');
        }

        return (int) $value;
    }
}
