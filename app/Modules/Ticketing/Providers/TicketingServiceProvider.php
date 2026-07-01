<?php

namespace App\Modules\Ticketing\Providers;

use App\Modules\Ticketing\Contracts\TicketTypeServiceInterface;
use App\Modules\Ticketing\Repositories\Contracts\TicketTypeRepositoryInterface;
use App\Modules\Ticketing\Repositories\Eloquent\TicketTypeRepository;
use App\Modules\Ticketing\Services\TicketTypeService;
use Illuminate\Support\ServiceProvider;

class TicketingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 4).'/config/ticketing_module.php',
            'ticketing_module'
        );

        $this->app->singleton(TicketTypeRepositoryInterface::class, TicketTypeRepository::class);
        $this->app->singleton(TicketTypeServiceInterface::class, TicketTypeService::class);
    }

    public function boot(): void
    {
        //
    }
}
