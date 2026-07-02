<?php

namespace App\Modules\Admin\Providers;

use App\Modules\Admin\Contracts\ActivityLogServiceInterface;
use App\Modules\Admin\Contracts\AdminAnalyticsServiceInterface;
use App\Modules\Admin\Contracts\AuditLogServiceInterface;
use App\Modules\Admin\Contracts\DailyStatsRecorderServiceInterface;
use App\Modules\Admin\Contracts\PlatformSettingServiceInterface;
use App\Modules\Admin\Repositories\Contracts\PlatformSettingRepositoryInterface;
use App\Modules\Admin\Repositories\Eloquent\PlatformSettingRepository;
use App\Modules\Admin\Services\ActivityLogService;
use App\Modules\Admin\Services\AdminAnalyticsService;
use App\Modules\Admin\Services\AuditLogService;
use App\Modules\Admin\Services\DailyStatsRecorderService;
use App\Modules\Admin\Services\PlatformSettingService;
use Illuminate\Support\ServiceProvider;

class AdminServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 4).'/config/admin_module.php',
            'admin_module'
        );

        $this->app->singleton(PlatformSettingRepositoryInterface::class, PlatformSettingRepository::class);
        $this->app->singleton(PlatformSettingServiceInterface::class, PlatformSettingService::class);
        $this->app->singleton(AuditLogServiceInterface::class, AuditLogService::class);
        $this->app->singleton(ActivityLogServiceInterface::class, ActivityLogService::class);
        $this->app->singleton(DailyStatsRecorderServiceInterface::class, DailyStatsRecorderService::class);
        $this->app->singleton(AdminAnalyticsServiceInterface::class, AdminAnalyticsService::class);
    }

    public function boot(): void
    {
        //
    }
}
