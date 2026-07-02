<?php

namespace App\Modules\Admin\Http\Middleware;

use App\Modules\Admin\Contracts\PlatformSettingServiceInterface;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlatformMaintenance
{
    public function __construct(
        private readonly PlatformSettingServiceInterface $settings,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->settings->isMaintenanceModeEnabled()) {
            return $next($request);
        }

        if ($this->shouldBypass($request)) {
            return $next($request);
        }

        $message = $this->settings->getValue('maintenance_mode')['message']
            ?? 'Platform is under maintenance.';

        return response()->json([
            'message' => $message,
            'error_code' => 'PLATFORM_MAINTENANCE',
        ], Response::HTTP_SERVICE_UNAVAILABLE);
    }

    private function shouldBypass(Request $request): bool
    {
        if ($request->is('api/v1/health')) {
            return true;
        }

        if ($request->is('api/v1/admin') || $request->is('api/v1/admin/*')) {
            return true;
        }

        if ($request->is('api/v1/auth/login') || $request->is('api/v1/auth/me')) {
            return true;
        }

        $user = $request->user();

        return $user !== null && $user->isSuperAdmin();
    }
}
