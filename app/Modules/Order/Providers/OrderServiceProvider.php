<?php

namespace App\Modules\Order\Providers;

use App\Modules\Order\Contracts\CheckoutServiceInterface;
use App\Modules\Order\Contracts\OrderFulfillmentServiceInterface;
use App\Modules\Order\Repositories\Contracts\OrderRepositoryInterface;
use App\Modules\Order\Repositories\Eloquent\OrderRepository;
use App\Modules\Order\Contracts\PromoCodeServiceInterface;
use App\Modules\Order\Services\CheckoutService;
use App\Modules\Order\Services\PromoCodeService;
use App\Modules\Order\Services\OrderFulfillmentService;
use Illuminate\Support\ServiceProvider;

class OrderServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 4).'/config/order_module.php',
            'order_module'
        );

        $this->app->singleton(OrderRepositoryInterface::class, OrderRepository::class);
        $this->app->singleton(PromoCodeServiceInterface::class, PromoCodeService::class);
        $this->app->singleton(OrderFulfillmentServiceInterface::class, OrderFulfillmentService::class);
        $this->app->singleton(CheckoutServiceInterface::class, CheckoutService::class);
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                \App\Modules\Order\Console\ExpirePendingOrdersCommand::class,
            ]);
        }
    }
}
