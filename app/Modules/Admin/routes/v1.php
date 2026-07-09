<?php

use App\Modules\Admin\Http\Controllers\V1\AdminActivityLogController;
use App\Modules\Admin\Http\Controllers\V1\AdminAuditLogController;
use App\Modules\Admin\Http\Controllers\V1\AdminDashboardController;
use App\Modules\Admin\Http\Controllers\V1\AdminWithdrawalController;
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
    Route::get('withdrawals', [AdminWithdrawalController::class, 'index'])
        ->name('withdrawals.index');
    Route::patch('withdrawals/{uuid}', [AdminWithdrawalController::class, 'update'])
        ->name('withdrawals.update');
    Route::post('withdrawals/{uuid}/documents', [AdminWithdrawalController::class, 'uploadDocument'])
        ->name('withdrawals.documents.store');

    Route::get('settings', [PlatformSettingController::class, 'index'])->name('settings.index');
    Route::patch('settings/{key}', [PlatformSettingController::class, 'update'])->name('settings.update');
});
