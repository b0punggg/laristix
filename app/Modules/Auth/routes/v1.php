<?php

use App\Modules\Auth\Http\Controllers\V1\AuthController;
use App\Modules\Auth\Http\Controllers\V1\EmailVerificationController;
use App\Modules\Auth\Http\Controllers\V1\MeController;
use App\Modules\Auth\Http\Controllers\V1\PasswordResetController;
use App\Modules\Auth\Http\Controllers\V1\PersonalAccessTokenController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->name('auth.')->group(function () {
    Route::middleware('throttle:'.config('auth_module.rate_limits.register'))->group(function () {
        Route::post('register', [AuthController::class, 'register'])->name('register');
    });

    Route::middleware('throttle:'.config('auth_module.rate_limits.login'))->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('login');
    });

    Route::middleware('throttle:'.config('auth_module.rate_limits.forgot_password'))->group(function () {
        Route::post('forgot-password', [PasswordResetController::class, 'forgot'])->name('password.forgot');
    });

    Route::middleware('throttle:'.config('auth_module.rate_limits.reset_password'))->group(function () {
        Route::post('reset-password', [PasswordResetController::class, 'reset'])->name('password.reset');
    });

    Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:'.config('auth_module.rate_limits.verify_email')])
        ->name('verification.verify');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');

        Route::post('email/verification-notification', [EmailVerificationController::class, 'notice'])
            ->middleware('throttle:'.config('auth_module.rate_limits.verify_email'))
            ->name('verification.notice');

        Route::get('me', [MeController::class, 'show'])->name('me');
        Route::get('organizers', [MeController::class, 'organizers'])->name('organizers.index');
        Route::post('organizer/switch', [MeController::class, 'switchOrganizer'])
            ->middleware('throttle:'.config('auth_module.rate_limits.switch_organizer'))
            ->name('organizer.switch');

        Route::post('tokens', [PersonalAccessTokenController::class, 'store'])->name('tokens.store');
        Route::delete('tokens/current', [PersonalAccessTokenController::class, 'destroy'])->name('tokens.destroy');
    });
});
