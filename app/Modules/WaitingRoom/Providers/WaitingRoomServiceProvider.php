<?php

namespace App\Modules\WaitingRoom\Providers;

use App\Modules\WaitingRoom\Contracts\QueueStoreInterface;
use App\Modules\WaitingRoom\Contracts\WaitingRoomMonitoringServiceInterface;
use App\Modules\WaitingRoom\Contracts\WaitingRoomServiceInterface;
use App\Modules\WaitingRoom\Repositories\ArrayQueueStore;
use App\Modules\WaitingRoom\Repositories\RedisQueueStore;
use App\Modules\WaitingRoom\Services\WaitingRoomService;
use Illuminate\Support\ServiceProvider;

class WaitingRoomServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 4).'/config/waiting_room_module.php',
            'waiting_room_module'
        );

        $this->app->singleton(QueueStoreInterface::class, function () {
            $driver = (string) config('waiting_room_module.driver', 'array');

            if ($driver === 'array' || ! extension_loaded('redis')) {
                return new ArrayQueueStore();
            }

            return new RedisQueueStore();
        });

        $this->app->singleton(WaitingRoomServiceInterface::class, WaitingRoomService::class);
        $this->app->singleton(WaitingRoomMonitoringServiceInterface::class, \App\Modules\WaitingRoom\Services\WaitingRoomMonitoringService::class);
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                \App\Modules\WaitingRoom\Console\PromoteWaitingRoomCommand::class,
            ]);
        }
    }
}
