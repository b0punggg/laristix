<?php

use App\Modules\Organizer\Http\Controllers\V1\AdminOrganizerController;
use App\Modules\Organizer\Http\Controllers\V1\AdminOrganizerFeeConfigController;
use App\Modules\Organizer\Http\Controllers\V1\OrganizerController;
use App\Modules\Organizer\Http\Controllers\V1\OrganizerDashboardController;
use App\Modules\Organizer\Http\Controllers\V1\OrganizerMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('throttle:'.config('organizer_module.rate_limits.create'))->group(function () {
        Route::post('organizers', [OrganizerController::class, 'store'])->name('organizers.store');
    });

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('organizers', [AdminOrganizerController::class, 'index'])
            ->name('organizers.index');
        Route::get('organizers/pending', [OrganizerController::class, 'indexPending'])
            ->name('organizers.pending');
        Route::get('organizers/{uuid}', [AdminOrganizerController::class, 'show'])
            ->name('organizers.show');
        Route::get('organizers/{uuid}/fee-configs', [AdminOrganizerFeeConfigController::class, 'index'])
            ->name('organizers.fee-configs.index');
        Route::post('organizers/{uuid}/fee-configs', [AdminOrganizerFeeConfigController::class, 'store'])
            ->name('organizers.fee-configs.store');
        Route::patch('organizers/{uuid}/fee-configs/{feeConfigId}', [AdminOrganizerFeeConfigController::class, 'update'])
            ->name('organizers.fee-configs.update');
        Route::delete('organizers/{uuid}/fee-configs/{feeConfigId}', [AdminOrganizerFeeConfigController::class, 'destroy'])
            ->name('organizers.fee-configs.destroy');
        Route::post('organizers/{uuid}/approve', [OrganizerController::class, 'approve'])
            ->name('organizers.approve');
        Route::post('organizers/{uuid}/reject', [AdminOrganizerController::class, 'reject'])
            ->name('organizers.reject');
        Route::patch('organizers/{uuid}/suspend', [AdminOrganizerController::class, 'suspend'])
            ->name('organizers.suspend');
        Route::patch('organizers/{uuid}/activate', [AdminOrganizerController::class, 'activate'])
            ->name('organizers.activate');
    });

    Route::middleware(['resolve.organizer', 'organizer.context'])->group(function () {
        Route::get('organizers/current/dashboard/summary', [OrganizerDashboardController::class, 'summary'])
            ->name('organizers.current.dashboard.summary');
        Route::get('organizers/current/dashboard/trends', [OrganizerDashboardController::class, 'trends'])
            ->name('organizers.current.dashboard.trends');
        Route::get('organizers/current/dashboard/insights', [OrganizerDashboardController::class, 'insights'])
            ->name('organizers.current.dashboard.insights');
        Route::get('organizers/current/dashboard/scanner-summary', [OrganizerDashboardController::class, 'scannerSummary'])
            ->name('organizers.current.dashboard.scanner-summary');

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
