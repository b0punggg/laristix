<?php

return [
    'order_ttl_minutes' => (int) env('ORDER_TTL_MINUTES', 30),
    'order_number_prefix' => 'ORD',

    'rate_limits' => [
        'checkout' => '10,1',
    ],

    'pagination' => [
        'my_orders_per_page' => 15,
    ],
];
