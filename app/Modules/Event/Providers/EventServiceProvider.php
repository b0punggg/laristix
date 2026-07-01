<?php

namespace App\Modules\Event\Providers;

use App\Modules\Event\Contracts\EventServiceInterface;
use App\Modules\Event\Contracts\VenueServiceInterface;
use App\Modules\Event\Repositories\Contracts\EventCategoryRepositoryInterface;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use App\Modules\Event\Repositories\Contracts\VenueRepositoryInterface;
use App\Modules\Event\Repositories\Eloquent\EventCategoryRepository;
use App\Modules\Event\Repositories\Eloquent\EventRepository;
use App\Modules\Event\Repositories\Eloquent\VenueRepository;
use App\Modules\Event\Services\EventService;
use App\Modules\Event\Services\VenueService;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 4).'/config/event_module.php',
            'event_module'
        );

        $this->app->singleton(EventRepositoryInterface::class, EventRepository::class);
        $this->app->singleton(VenueRepositoryInterface::class, VenueRepository::class);
        $this->app->singleton(EventCategoryRepositoryInterface::class, EventCategoryRepository::class);
        $this->app->singleton(EventServiceInterface::class, EventService::class);
        $this->app->singleton(VenueServiceInterface::class, VenueService::class);
    }

    public function boot(): void
    {
        //
    }
}
