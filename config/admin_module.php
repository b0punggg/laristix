<?php

return [

    'default_settings' => [
        'maintenance_mode' => [
            'enabled' => false,
            'message' => 'Platform is under maintenance. Please try again later.',
        ],
        'default_platform_fee' => [
            'fee_type' => 'percentage',
            'percentage_rate' => 5.0,
            'flat_amount' => 0,
            'fee_bearer' => 'attendee',
        ],
    ],

];
