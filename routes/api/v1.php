<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timezone' => config('app.timezone'),
        'server_time' => now()->toIso8601String(),
    ]);
});

require base_path('app/Modules/Auth/routes/v1.php');
require base_path('app/Modules/Organizer/routes/v1.php');
require base_path('app/Modules/Event/routes/v1.php');
require base_path('app/Modules/Ticketing/routes/v1.php');
require base_path('app/Modules/Order/routes/v1.php');
require base_path('app/Modules/Payment/routes/v1.php');
