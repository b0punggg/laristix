<?php

return [

  'password_reset' => [
    'broker' => 'users',
    'throttle' => 60,
  ],

  'verification' => [
    'expire' => 60,
  ],

  'token' => [
    'default_abilities' => ['*'],
    'scanner_abilities' => ['check-in:scan', 'check-in:read'],
    'scanner_token_name' => 'scanner',
    'default_expiry_days' => 90,
  ],

  'rate_limits' => [
    'login' => '5,1',
    'register' => '3,1',
    'forgot_password' => '3,1',
    'reset_password' => '5,1',
    'verify_email' => '6,1',
    'switch_organizer' => '10,1',
  ],

  'require_email_verification' => env('AUTH_REQUIRE_EMAIL_VERIFICATION', true),

  'session' => [
    'regenerate_on_login' => true,
  ],

];
