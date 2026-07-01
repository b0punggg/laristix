<?php

namespace App\Core\Providers;

use App\Core\Tenancy\Contracts\ActiveOrganizerServiceInterface;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Core\Tenancy\Contracts\OrganizerMembershipValidatorInterface;
use App\Core\Tenancy\Scopes\OrganizerScope;
use App\Core\Tenancy\Services\ActiveOrganizerService;
use App\Core\Tenancy\Services\OrganizerContext;
use App\Core\Tenancy\Services\OrganizerMembershipValidator;
use Illuminate\Support\ServiceProvider;

class TenancyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 3).'/config/tenancy.php',
            'tenancy'
        );

        // Laravel 10: use singleton (scoped() is Laravel 11+).
        // Context is cleared at the start of each request in middleware.
        $this->app->singleton(OrganizerContext::class);
        $this->app->alias(OrganizerContext::class, OrganizerContextInterface::class);

        $this->app->singleton(OrganizerScope::class, function ($app) {
            return new OrganizerScope($app->make(OrganizerContextInterface::class));
        });

        $this->app->singleton(OrganizerMembershipValidatorInterface::class, OrganizerMembershipValidator::class);
        $this->app->singleton(ActiveOrganizerServiceInterface::class, ActiveOrganizerService::class);
    }

    public function boot(): void
    {
        //
    }
}
