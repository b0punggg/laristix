<?php

use App\Modules\Event\Http\Controllers\V1\AdminEventController;
use App\Modules\Event\Http\Controllers\V1\PublicDiscoveryController;
use App\Modules\Event\Http\Controllers\V1\EventCategoryController;
use App\Modules\Event\Http\Controllers\V1\EventController;
use App\Modules\Event\Http\Controllers\V1\EventDashboardController;
use App\Modules\Event\Http\Controllers\V1\EventManagementController;
use App\Modules\Event\Http\Controllers\V1\VenueController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->name('public.')->group(function () {
    Route::get('events', [EventController::class, 'indexPublic'])->name('events.index');
    Route::get('events/{uuid}', [EventController::class, 'showPublic'])->name('events.show');
    Route::get('event-categories', [PublicDiscoveryController::class, 'categories'])->name('event-categories.index');
    Route::get('cities', [PublicDiscoveryController::class, 'cities'])->name('cities.index');
    Route::get('stats', [PublicDiscoveryController::class, 'stats'])->name('stats');
    Route::get('featured-organizers', [PublicDiscoveryController::class, 'featuredOrganizers'])->name('featured-organizers');
    Route::get('creators/{slug}', [PublicDiscoveryController::class, 'showCreator'])->name('creators.show');
});

Route::middleware('auth:sanctum')->prefix('admin')->name('admin.')->group(function () {
    Route::get('events', [AdminEventController::class, 'index'])->name('events.index');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware(['resolve.organizer', 'organizer.context'])->group(function () {
        Route::get('events', [EventManagementController::class, 'index'])->name('events.index');
        Route::post('events', [EventManagementController::class, 'store'])
            ->middleware('throttle:'.config('event_module.rate_limits.create'))
            ->name('events.store');
        Route::get('events/{uuid}', [EventManagementController::class, 'show'])->name('events.show');
        Route::patch('events/{uuid}', [EventManagementController::class, 'update'])
            ->middleware('throttle:'.config('event_module.rate_limits.update'))
            ->name('events.update');
        Route::delete('events/{uuid}', [EventManagementController::class, 'destroy'])->name('events.destroy');
        Route::post('events/{uuid}/publish', [EventManagementController::class, 'publish'])
            ->middleware('throttle:'.config('event_module.rate_limits.publish'))
            ->name('events.publish');
        Route::post('events/{uuid}/draft', [EventManagementController::class, 'draft'])
            ->middleware('throttle:'.config('event_module.rate_limits.update'))
            ->name('events.draft');

        Route::get('events/{uuid}/dashboard/summary', [EventDashboardController::class, 'summary'])
            ->name('events.dashboard.summary');
        Route::get('events/{uuid}/dashboard/trends', [EventDashboardController::class, 'trends'])
            ->name('events.dashboard.trends');
        Route::get('events/{uuid}/dashboard/insights', [EventDashboardController::class, 'insights'])
            ->name('events.dashboard.insights');

        Route::get('venues', [VenueController::class, 'index'])->name('venues.index');
        Route::post('venues', [VenueController::class, 'store'])->name('venues.store');
        Route::delete('venues/{venueId}', [VenueController::class, 'destroy'])->name('venues.destroy');

        Route::get('event-categories', [EventCategoryController::class, 'indexAuthenticated'])
            ->name('event-categories.index');
    });
});
