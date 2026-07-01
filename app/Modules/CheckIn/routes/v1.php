<?php

use App\Modules\CheckIn\Http\Controllers\V1\CheckInController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('tickets/{ticketUuid}/qr', [CheckInController::class, 'ticketQr'])
        ->name('tickets.qr');

    Route::middleware(['resolve.organizer', 'organizer.context'])->group(function () {
        Route::get('events/{eventUuid}/check-in/gates', [CheckInController::class, 'gatesIndex'])
            ->name('events.check-in.gates.index');
        Route::post('events/{eventUuid}/check-in/gates', [CheckInController::class, 'gatesStore'])
            ->middleware('throttle:'.config('check_in_module.rate_limits.gate_create'))
            ->name('events.check-in.gates.store');
        Route::patch('events/{eventUuid}/check-in/gates/{gateId}', [CheckInController::class, 'gatesUpdate'])
            ->name('events.check-in.gates.update');
        Route::delete('events/{eventUuid}/check-in/gates/{gateId}', [CheckInController::class, 'gatesDestroy'])
            ->name('events.check-in.gates.destroy');

        Route::get('events/{eventUuid}/check-ins', [CheckInController::class, 'index'])
            ->name('events.check-ins.index');
        Route::get('events/{eventUuid}/check-ins/stats', [CheckInController::class, 'stats'])
            ->name('events.check-ins.stats');
        Route::get('events/{eventUuid}/check-ins/gates', [CheckInController::class, 'scanGates'])
            ->name('events.check-ins.gates');
        Route::post('events/{eventUuid}/check-ins/verify', [CheckInController::class, 'verify'])
            ->middleware('throttle:'.config('check_in_module.rate_limits.scan'))
            ->name('events.check-ins.verify');
        Route::post('events/{eventUuid}/check-ins/scan', [CheckInController::class, 'scan'])
            ->middleware('throttle:'.config('check_in_module.rate_limits.scan'))
            ->name('events.check-ins.scan');
        Route::post('events/{eventUuid}/check-ins/manual', [CheckInController::class, 'manual'])
            ->middleware('throttle:'.config('check_in_module.rate_limits.manual'))
            ->name('events.check-ins.manual');
    });
});
