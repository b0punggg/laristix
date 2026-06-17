<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Organizer session
    |--------------------------------------------------------------------------
    |
    | Primary source for active organizer resolution. Set by ActiveOrganizerService
    | after membership validation — never trust client headers alone.
    |
    */
    'session_key' => 'active_organizer_id',

    /*
    |--------------------------------------------------------------------------
    | Optional header hint
    |--------------------------------------------------------------------------
    |
    | When enabled, X-Organizer-Id may be sent as a hint. It MUST match an
    | active organizer_members row for the authenticated user.
    |
    */
    'header_hint_enabled' => env('TENANCY_HEADER_HINT_ENABLED', true),
    'header_name' => 'X-Organizer-Id',

    /*
    |--------------------------------------------------------------------------
    | Global scope
    |--------------------------------------------------------------------------
    */
    'scope_enabled' => env('TENANCY_SCOPE_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Organizer statuses considered accessible to members
    |--------------------------------------------------------------------------
    */
    'accessible_organizer_statuses' => ['active'],

    /*
    |--------------------------------------------------------------------------
    | Auto-select when user belongs to exactly one accessible organizer
    |--------------------------------------------------------------------------
    */
    'auto_select_single_organizer' => true,

    /*
    |--------------------------------------------------------------------------
    | Super admin bypass on platform admin routes (no tenant scope)
    |--------------------------------------------------------------------------
    */
    'super_admin_bypass_route_prefix' => 'admin',

    /*
    |--------------------------------------------------------------------------
    | Middleware aliases
    |--------------------------------------------------------------------------
    */
    'middleware' => [
        'resolve_organizer' => \App\Core\Tenancy\Middleware\ResolveOrganizerContext::class,
        'organizer' => \App\Core\Tenancy\Middleware\EnsureOrganizerContext::class,
    ],

];
