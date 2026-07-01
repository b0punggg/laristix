<?php

namespace App\Modules\Payment\Providers;

use App\Modules\Payment\Contracts\MidtransSnapServiceInterface;
use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Contracts\PaymentWebhookServiceInterface;
use App\Modules\Payment\Contracts\TransactionValidationServiceInterface;
use App\Modules\Payment\Gateways\MidtransGateway;
use App\Modules\Payment\Repositories\Contracts\PaymentRepositoryInterface;
use App\Modules\Payment\Repositories\Eloquent\PaymentRepository;
use App\Modules\Payment\Services\MidtransSnapService;
use App\Modules\Payment\Services\PaymentStatusSyncService;
use App\Modules\Payment\Services\PaymentWebhookService;
use App\Modules\Payment\Services\TransactionValidationService;
use Illuminate\Support\ServiceProvider;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 4).'/config/payment_module.php',
            'payment_module'
        );

        $this->app->singleton(PaymentRepositoryInterface::class, PaymentRepository::class);
        $this->app->singleton(PaymentGatewayInterface::class, MidtransGateway::class);
        $this->app->singleton(PaymentStatusSyncService::class);
        $this->app->singleton(MidtransSnapServiceInterface::class, MidtransSnapService::class);
        $this->app->singleton(PaymentWebhookServiceInterface::class, PaymentWebhookService::class);
        $this->app->singleton(TransactionValidationServiceInterface::class, TransactionValidationService::class);
    }

    public function boot(): void
    {
        //
    }
}
