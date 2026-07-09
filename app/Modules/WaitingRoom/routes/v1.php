<?php

use App\Modules\WaitingRoom\Http\Controllers\V1\AdminWaitingRoomController;
use App\Modules\WaitingRoom\Http\Controllers\V1\WaitingRoomController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->name('public.')->group(function () {
    Route::get('events/{eventUuid}/queue/status', [WaitingRoomController::class, 'status'])
        ->middleware('throttle:'.config('waiting_room_module.rate_limits.status'))
        ->name('events.queue.status');

    Route::post('events/{eventUuid}/queue/join', [WaitingRoomController::class, 'join'])
        ->middleware('throttle:'.config('waiting_room_module.rate_limits.join'))
        ->name('events.queue.join');
});

Route::middleware('auth:sanctum')->prefix('admin')->name('admin.')->group(function () {
    Route::get('waiting-room/queues', [AdminWaitingRoomController::class, 'index'])
        ->name('waiting-room.queues.index');
    Route::get('waiting-room/events/{eventUuid}', [AdminWaitingRoomController::class, 'show'])
        ->name('waiting-room.events.show');
    Route::post('waiting-room/events/{eventUuid}/promote', [AdminWaitingRoomController::class, 'promote'])
        ->name('waiting-room.events.promote');
});
