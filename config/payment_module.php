<?php

$midtransIsProduction = filter_var(env('MIDTRANS_IS_PRODUCTION', false), FILTER_VALIDATE_BOOLEAN);

return [
    'gateway' => env('PAYMENT_GATEWAY', 'midtrans'),

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY', ''),
        'client_key' => env('MIDTRANS_CLIENT_KEY', ''),
        'is_production' => $midtransIsProduction,
        'snap_url' => $midtransIsProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
        'api_url' => $midtransIsProduction
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com',
        'sanitized_server_key' => env('MIDTRANS_SERVER_KEY', '') !== ''
            && ! str_contains(env('MIDTRANS_SERVER_KEY', ''), 'your-'),
    ],

    'webhook' => [
        'path' => 'webhooks/midtrans',
    ],

    'rate_limits' => [
        'checkout' => '10,1',
        'validate' => '20,1',
    ],
];
