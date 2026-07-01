<?php

use App\Modules\Organizer\Http\Controllers\V1\OrganizerController;
use App\Modules\Organizer\Http\Controllers\V1\OrganizerMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('throttle:'.config('organizer_module.rate_limits.create'))->group(function () {
        Route::post('organizers', [OrganizerController::class, 'store'])->name('organizers.store');
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('organizers/pending', [OrganizerController::class, 'indexPending'])
            ->name('organizers.pending');
        Route::post('organizers/{uuid}/approve', [OrganizerController::class, 'approve'])
            ->name('organizers.approve');
    });

    Route::middleware(['resolve.organizer', 'organizer.context'])->group(function () {
        Route::get('organizers/current', [OrganizerController::class, 'showCurrent'])
            ->name('organizers.current.show');
        Route::patch('organizers/current', [OrganizerController::class, 'updateCurrent'])
            ->middleware('throttle:'.config('organizer_module.rate_limits.update'))
            ->name('organizers.current.update');

        Route::get('organizers/current/members', [OrganizerMemberController::class, 'index'])
            ->name('organizers.members.index');
        Route::post('organizers/current/members', [OrganizerMemberController::class, 'store'])
            ->middleware('throttle:'.config('organizer_module.rate_limits.invite_member'))
            ->name('organizers.members.store');
        Route::patch('organizers/current/members/{memberId}', [OrganizerMemberController::class, 'update'])
            ->name('organizers.members.update');
        Route::delete('organizers/current/members/{memberId}', [OrganizerMemberController::class, 'destroy'])
            ->name('organizers.members.destroy');
    });
});
