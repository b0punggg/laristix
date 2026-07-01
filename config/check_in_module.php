<?php

return [

    'rate_limits' => [
        'scan' => '120,1',
        'manual' => '60,1',
        'gate_create' => '30,1',
    ],

    'pagination' => [
        'check_ins_per_page' => 20,
    ],

    'qr_prefix' => 'LX:',

];
