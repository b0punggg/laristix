<?php

use App\Modules\Order\Http\Controllers\V1\CheckoutController;
use App\Modules\Order\Http\Controllers\V1\PublicOrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->name('public.')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('events/{eventUuid}/checkout', [CheckoutController::class, 'store'])
            ->middleware('throttle:'.config('order_module.rate_limits.checkout'))
            ->name('events.checkout');

        Route::get('orders', [PublicOrderController::class, 'index'])
            ->name('orders.index');

        Route::get('orders/{uuid}', [PublicOrderController::class, 'show'])
            ->name('orders.show');

        Route::post('orders/{uuid}/validate-payment', [PublicOrderController::class, 'validatePayment'])
            ->middleware('throttle:'.config('payment_module.rate_limits.validate'))
            ->name('orders.validate-payment');
    });
});
