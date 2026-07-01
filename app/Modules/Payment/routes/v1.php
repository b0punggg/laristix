<?php

use App\Modules\Payment\Http\Controllers\V1\MidtransWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('webhooks/midtrans', [MidtransWebhookController::class, 'handle'])
    ->name('webhooks.midtrans');
