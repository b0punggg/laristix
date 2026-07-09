<?php

return [
    'enabled' => (bool) env('WAITING_ROOM_ENABLED', true),

    // redis|array — local/testing default to array; production uses redis
    'driver' => env(
        'WAITING_ROOM_DRIVER',
        in_array(env('APP_ENV'), ['local', 'testing'], true) ? 'array' : 'redis',
    ),

    'admit_batch_size' => (int) env('WAITING_ROOM_ADMIT_BATCH', 200),
    'admit_interval_seconds' => (int) env('WAITING_ROOM_ADMIT_INTERVAL', 180),
    'admission_token_ttl_seconds' => (int) env('WAITING_ROOM_ADMISSION_TTL', 300),
    'session_ttl_seconds' => (int) env('WAITING_ROOM_SESSION_TTL', 3600),
    'poll_interval_seconds' => (int) env('WAITING_ROOM_POLL_SECONDS', 3),

    'order_ttl_normal_minutes' => (int) env('ORDER_TTL_MINUTES', 30),
    'order_ttl_high_demand_minutes' => (int) env('WAITING_ROOM_ORDER_TTL_MINUTES', 12),

    'traffic' => [
        'threshold' => (int) env('WAITING_ROOM_TRAFFIC_THRESHOLD', 80),
        'window_seconds' => (int) env('WAITING_ROOM_TRAFFIC_WINDOW', 10),
        'cooldown_seconds' => (int) env('WAITING_ROOM_COOLDOWN_SECONDS', 300),
        'min_active_seconds' => (int) env('WAITING_ROOM_MIN_ACTIVE_SECONDS', 180),
    ],

    'rate_limits' => [
        'join' => '30,1',
        'status' => '120,1',
    ],
];
