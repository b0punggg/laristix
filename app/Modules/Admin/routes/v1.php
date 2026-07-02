<?php

use App\Modules\Admin\Http\Controllers\V1\AdminActivityLogController;
use App\Modules\Admin\Http\Controllers\V1\AdminAuditLogController;
use App\Modules\Admin\Http\Controllers\V1\AdminDashboardController;
use App\Modules\Admin\Http\Controllers\V1\PlatformSettingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard/summary', [AdminDashboardController::class, 'summary'])
        ->name('dashboard.summary');
    Route::get('analytics/trends', [AdminDashboardController::class, 'trends'])
        ->name('analytics.trends');

    Route::get('activity-logs', [AdminActivityLogController::class, 'index'])
        ->name('activity-logs.index');
    Route::get('audit-logs', [AdminAuditLogController::class, 'index'])
        ->name('audit-logs.index');

    Route::get('settings', [PlatformSettingController::class, 'index'])->name('settings.index');
    Route::patch('settings/{key}', [PlatformSettingController::class, 'update'])->name('settings.update');
});
