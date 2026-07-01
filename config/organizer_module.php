<?php

return [

    'auto_approve' => env('ORGANIZER_AUTO_APPROVE', false),

    'default_country' => 'ID',
    'default_currency' => 'IDR',
    'default_timezone' => 'Asia/Jakarta',

    'rate_limits' => [
        'create' => '5,1',
        'invite_member' => '10,1',
        'update' => '20,1',
    ],

];
