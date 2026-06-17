# Laravel Registration (after scaffold)

## 1. Register service provider

`bootstrap/providers.php`:

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Core\Providers\TenancyServiceProvider::class,
];
```

## 2. Register middleware aliases

`bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'resolve.organizer' => \App\Core\Tenancy\Middleware\ResolveOrganizerContext::class,
        'organizer' => \App\Core\Tenancy\Middleware\EnsureOrganizerContext::class,
    ]);

    $middleware->appendToGroup('api', [
        \App\Core\Tenancy\Middleware\ResolveOrganizerContext::class,
    ]);
})
```

## 3. Apply to route groups

```php
// Organizer dashboard API
Route::middleware(['auth:sanctum', 'organizer'])->prefix('organizer')->group(...);

// Public routes — no EnsureOrganizerContext
```

## 4. Exception handler

Replace default handler or extend:

```php
// bootstrap/app.php
->withExceptions(function (Exceptions $exceptions) {
    // Laravel 11 uses App\Exceptions\Handler by default.
    // Bind App\Core\Exceptions\Handler when integrating.
})
```

## Resolution flow

```
Authenticated User
    → Session active_organizer_id (primary)
    → Optional X-Organizer-Id (hint, membership validated)
    → OrganizerMembershipValidator
    → OrganizerContext (request-scoped)
    → OrganizerScope on tenant models
```
