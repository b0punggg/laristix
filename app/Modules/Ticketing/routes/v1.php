<?php

use App\Modules\Ticketing\Http\Controllers\V1\TicketTypeManagementController;
use App\Modules\Ticketing\Http\Controllers\V1\TicketTypePublicController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->name('public.')->group(function () {
    Route::get('events/{uuid}/ticket-types', [TicketTypePublicController::class, 'index'])
        ->name('events.ticket-types.index');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware(['resolve.organizer', 'organizer.context'])->group(function () {
        Route::get('events/{eventUuid}/ticket-types', [TicketTypeManagementController::class, 'index'])
            ->name('events.ticket-types.index');
        Route::post('events/{eventUuid}/ticket-types', [TicketTypeManagementController::class, 'store'])
            ->middleware('throttle:'.config('ticketing_module.rate_limits.create'))
            ->name('events.ticket-types.store');
        Route::get('events/{eventUuid}/ticket-types/{ticketTypeId}', [TicketTypeManagementController::class, 'show'])
            ->name('events.ticket-types.show');
        Route::patch('events/{eventUuid}/ticket-types/{ticketTypeId}', [TicketTypeManagementController::class, 'update'])
            ->middleware('throttle:'.config('ticketing_module.rate_limits.update'))
            ->name('events.ticket-types.update');
        Route::delete('events/{eventUuid}/ticket-types/{ticketTypeId}', [TicketTypeManagementController::class, 'destroy'])
            ->name('events.ticket-types.destroy');
    });
});
