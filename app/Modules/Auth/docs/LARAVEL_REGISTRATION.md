# Laravel bootstrap — Auth + Tenancy providers

Register in `bootstrap/providers.php`:

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Core\Providers\TenancyServiceProvider::class,
    App\Modules\Auth\Providers\AuthServiceProvider::class,
];
```

Load API routes in `bootstrap/app.php`:

```php
->withRouting(
    api: __DIR__.'/../routes/api.php',
)
```

Configure Sanctum stateful domains in `.env`:

```
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1
SESSION_DRIVER=cookie
```

Add to `api` middleware group:

```php
$middleware->appendToGroup('api', [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    \App\Core\Tenancy\Middleware\ResolveOrganizerContext::class,
]);
```

Set auth model in `config/auth.php`:

```php
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => App\Modules\Auth\Models\User::class,
    ],
],
```
