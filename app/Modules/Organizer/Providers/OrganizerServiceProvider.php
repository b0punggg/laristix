<?php

namespace App\Modules\Organizer\Providers;

use App\Modules\Organizer\Contracts\CreateOrganizerServiceInterface;
use App\Modules\Organizer\Contracts\OrganizerAnalyticsServiceInterface;
use App\Modules\Organizer\Contracts\OrganizerFeeConfigServiceInterface;
use App\Modules\Organizer\Contracts\OrganizerMemberServiceInterface;
use App\Modules\Organizer\Contracts\OrganizerServiceInterface;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use App\Modules\Organizer\Repositories\Eloquent\OrganizerMemberRepository;
use App\Modules\Organizer\Repositories\Eloquent\OrganizerRepository;
use App\Modules\Organizer\Services\CreateOrganizerService;
use App\Modules\Organizer\Services\OrganizerAnalyticsService;
use App\Modules\Organizer\Services\OrganizerFeeConfigService;
use App\Modules\Organizer\Services\OrganizerMemberService;
use App\Modules\Organizer\Services\OrganizerService;
use Illuminate\Support\ServiceProvider;

class OrganizerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 4).'/config/organizer_module.php',
            'organizer_module'
        );

        $this->app->singleton(OrganizerRepositoryInterface::class, OrganizerRepository::class);
        $this->app->singleton(OrganizerMemberRepositoryInterface::class, OrganizerMemberRepository::class);
        $this->app->singleton(CreateOrganizerServiceInterface::class, CreateOrganizerService::class);
        $this->app->singleton(OrganizerServiceInterface::class, OrganizerService::class);
        $this->app->singleton(OrganizerAnalyticsServiceInterface::class, OrganizerAnalyticsService::class);
        $this->app->singleton(OrganizerMemberServiceInterface::class, OrganizerMemberService::class);
        $this->app->singleton(OrganizerFeeConfigServiceInterface::class, OrganizerFeeConfigService::class);
    }

    public function boot(): void
    {
        //
    }
}
