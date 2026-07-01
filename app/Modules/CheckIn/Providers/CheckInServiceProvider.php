<?php

namespace App\Modules\CheckIn\Providers;

use App\Modules\CheckIn\Contracts\CheckInGateRepositoryInterface;
use App\Modules\CheckIn\Contracts\CheckInGateServiceInterface;
use App\Modules\CheckIn\Contracts\CheckInRepositoryInterface;
use App\Modules\CheckIn\Contracts\CheckInServiceInterface;
use App\Modules\CheckIn\Repositories\Eloquent\CheckInGateRepository;
use App\Modules\CheckIn\Repositories\Eloquent\CheckInRepository;
use App\Modules\CheckIn\Services\CheckInGateService;
use App\Modules\CheckIn\Services\CheckInService;
use Illuminate\Support\ServiceProvider;

class CheckInServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 4).'/config/check_in_module.php',
            'check_in_module'
        );

        $this->app->singleton(CheckInRepositoryInterface::class, CheckInRepository::class);
        $this->app->singleton(CheckInGateRepositoryInterface::class, CheckInGateRepository::class);
        $this->app->singleton(CheckInServiceInterface::class, CheckInService::class);
        $this->app->singleton(CheckInGateServiceInterface::class, CheckInGateService::class);
    }

    public function boot(): void
    {
        //
    }
}
