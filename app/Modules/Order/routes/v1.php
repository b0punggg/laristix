<?php

use App\Modules\Order\Http\Controllers\V1\CheckoutController;
use App\Modules\Order\Http\Controllers\V1\CheckoutQuoteController;
use App\Modules\Order\Http\Controllers\V1\PublicOrderController;
use App\Modules\Order\Http\Controllers\V1\RegistrationFormManagementController;
use App\Modules\Order\Http\Controllers\V1\RegistrationFormPublicController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->name('public.')->group(function () {
    Route::get('events/{eventUuid}/registration-form', [RegistrationFormPublicController::class, 'show'])
        ->name('events.registration-form.show');

    Route::get('events/{eventUuid}/checkout/quote', [CheckoutQuoteController::class, 'show'])
        ->name('events.checkout.quote');

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

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware(['resolve.organizer', 'organizer.context'])->group(function () {
        Route::get('events/{eventUuid}/registration-form', [RegistrationFormManagementController::class, 'show'])
            ->name('events.registration-form.show');
        Route::put('events/{eventUuid}/registration-form/fields', [RegistrationFormManagementController::class, 'syncFields'])
            ->middleware('throttle:'.config('order_module.rate_limits.checkout'))
            ->name('events.registration-form.sync');
    });
});
