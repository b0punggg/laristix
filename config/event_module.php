<?php

return [

    'pagination' => [
        'per_page' => 15,
        'public_per_page' => 12,
    ],

    'rate_limits' => [
        'create' => '20,1',
        'update' => '30,1',
        'publish' => '10,1',
        'draft' => '10,1',
    ],

];
