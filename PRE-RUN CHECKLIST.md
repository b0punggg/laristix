# PRE-RUN CHECKLIST — Laravel 12 Bootstrap & Validation

Use this checklist **before** running `composer install`, `php artisan migrate`, or hitting any API endpoint.  
Project state: **custom modules exist** (`app/`, `config/`, `database/migrations/`, `routes/`) but **no Laravel skeleton yet** (no `composer.json`, `bootstrap/app.php`, `artisan`).

---

## Status Summary

| Area | Status | Action |
|------|--------|--------|
| Laravel skeleton | ❌ Missing | Scaffold Laravel 12 (Phase 1) |
| Custom modules | ✅ Present | Merge after scaffold |
| Migrations (000001–000044) | ✅ Present | Run after DB configured |
| Service providers | ✅ Written | Register in `bootstrap/providers.php` |
| Middleware | ✅ Written | Register aliases + API group |
| Routes | ⚠️ Review | Fix double `/api` prefix (see §5) |
| Composer autoload | ❌ Missing | Add `composer.json` (see §4) |
| `.env` | ❌ Missing | Copy from `.env.example` (see §6) |
| Sanctum | ⚠️ Partial | Install + configure (see §9) |
| Tenancy | ✅ Written | Register provider + middleware (see §10) |

---

## Phase 1 — Laravel 12 Scaffold Plan

Execute in order. Do **not** overwrite custom code in `app/`, `database/migrations/`, or module routes.

### Step 1: Create Laravel 12 project (sibling or merge)

**Option A — Merge into current directory (recommended for Laragon)**

```bash
cd c:\laragon\www
composer create-project laravel/laravel laristix-tmp "12.*"
```

Copy from `laristix-tmp` into `laristix` **without replacing**:

| Copy from Laravel | Into project |
|-------------------|--------------|
| `composer.json`, `composer.lock` | root |
| `artisan` | root |
| `bootstrap/` | root (merge `providers.php`) |
| `public/` | root |
| `storage/` | root |
| `vendor/` (after install) | root |
| `.env.example` | root |
| `phpunit.xml` | root |
| `config/app.php`, `auth.php`, `database.php`, `session.php`, `cors.php`, `sanctum.php`, `mail.php`, `queue.php`, `cache.php` | `config/` (merge) |
| `database/factories/`, `database/seeders/` | `database/` |

**Keep existing (do not overwrite):**

- `app/Core/`, `app/Modules/`, `app/Providers/AppServiceProvider.php`
- `database/migrations/000001_*` … `000044_*`
- `config/tenancy.php`, `config/auth_module.php`
- `routes/api.php`, `routes/api/v1.php` (after fixing §5)

Remove `laristix-tmp` after merge.

**Option B — Fresh install in place**

```bash
cd c:\laragon\www\laristix
composer create-project laravel/laravel . "12.*"
# Then re-apply custom app/, migrations, routes from git/backup
```

### Step 2: PHP & extensions

| Requirement | Value |
|-------------|-------|
| PHP | **8.3+** (Laravel 12) |
| Extensions | `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`, `pdo_mysql`, `tokenizer`, `xml` |

### Step 3: Composer dependencies

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Step 4: Register custom providers (see §2)

### Step 5: Configure bootstrap (see §3)

### Step 6: Environment (see §6)

### Step 7: Database & migrations

```bash
php artisan migrate
php artisan route:list --path=api/v1/auth
```

### Step 8: Smoke tests

```bash
php artisan test
curl -X POST http://laristix.test/api/v1/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"password\":\"password\",\"password_confirmation\":\"password\"}"
```

---

## Phase 2 — Namespace Verification

All PHP classes use **`App\` PSR-4 root** mapped to `app/`.

### Core (`App\Core\`)

| Namespace | Path | Count |
|-----------|------|-------|
| `App\Core\Exceptions` | `app/Core/Exceptions/` | 2 |
| `App\Core\Http\Controllers` | `app/Core/Http/Controllers/` | 1 |
| `App\Core\Providers` | `app/Core/Providers/` | 1 |
| `App\Core\Support\Traits` | `app/Core/Support/Traits/` | 2 |
| `App\Core\Tenancy\Contracts` | `app/Core/Tenancy/Contracts/` | 4 |
| `App\Core\Tenancy\Exceptions` | `app/Core/Tenancy/Exceptions/` | 5 |
| `App\Core\Tenancy\Middleware` | `app/Core/Tenancy/Middleware/` | 2 |
| `App\Core\Tenancy\Scopes` | `app/Core/Tenancy/Scopes/` | 1 |
| `App\Core\Tenancy\Services` | `app/Core/Tenancy/Services/` | 3 |

### Modules (`App\Modules\{Module}\`)

| Module | Namespaces |
|--------|------------|
| Auth | `Auth\Contracts`, `Auth.DTOs`, `Auth.Enums`, `Auth.Exceptions`, `Auth.Http.*`, `Auth.Models`, `Auth.Notifications`, `Auth.Providers`, `Auth.Repositories.*`, `Auth.Services` |
| Organizer | `Organizer.Models` |
| Admin | `Admin.Models` |
| Event | `Event.Models` |
| Form | `Form.Models` |
| Ticketing | `Ticketing.Models` |
| Order | `Order.Models` |
| Participant | `Participant.Models` |
| Payment | `Payment.Models` |
| CheckIn | `CheckIn.Models` |
| Referral | `Referral.Models` |
| Analytics | `Analytics.Models` |
| Notification | `Notification.Models` |

### Application (`App\Providers\`)

| Class | Path |
|-------|------|
| `App\Providers\AppServiceProvider` | `app/Providers/AppServiceProvider.php` |

### Tests (`Tests\`)

| Namespace | Path |
|-----------|------|
| `Tests\Unit\Core\Tenancy` | `tests/Unit/Core/Tenancy/` |
| `Tests\Unit\Modules\Auth` | `tests/Unit/Modules/Auth/` |

### Verification checklist

- [ ] `composer dump-autoload` succeeds with no PSR-4 warnings
- [ ] No duplicate class names under `app/`
- [ ] All `use App\...` imports resolve (run `php artisan about` after scaffold)
- [ ] Fix `app/Modules/Auth/docs/MODELS_REVIEW.md` — remove erroneous `<?php` / namespace (markdown only)

---

## Phase 3 — Service Provider Registrations

### `bootstrap/providers.php` entries

```php
<?php

return [
    App\Providers\AppServiceProvider::class,

    /*
     * Core
     */
    App\Core\Providers\TenancyServiceProvider::class,

    /*
     * Modules
     */
    App\Modules\Auth\Providers\AuthServiceProvider::class,

    /*
     * Laravel defaults (after scaffold — do not remove)
     */
    // App\Providers\AuthServiceProvider::class,  // Laravel default — keep if present
];
```

**Note:** Laravel 12 ships `App\Providers\AppServiceProvider` only by default. Do **not** register duplicate Laravel `AuthServiceProvider` if it conflicts with module naming — Laravel's is `Illuminate\Auth\AuthServiceProvider` via framework.

### Provider config merge paths (verified)

| Provider | Config file | Path resolution |
|----------|-------------|-----------------|
| `TenancyServiceProvider` | `config/tenancy.php` | `dirname(__DIR__, 3)` from `app/Core/Providers` → project root ✅ |
| `AuthServiceProvider` | `config/auth_module.php` | `dirname(__DIR__, 4)` from `app/Modules/Auth/Providers` → project root ✅ |

### Checklist

- [ ] `TenancyServiceProvider` registered **before** modules that depend on tenancy
- [ ] `AuthServiceProvider` registered after `TenancyServiceProvider`
- [ ] `php artisan config:clear` after changes

---

## Phase 4 — Middleware Registrations

### Middleware aliases (`bootstrap/app.php`)

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'resolve.organizer' => \App\Core\Tenancy\Middleware\ResolveOrganizerContext::class,
        'organizer'         => \App\Core\Tenancy\Middleware\EnsureOrganizerContext::class,
    ]);

    $middleware->appendToGroup('api', [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        \App\Core\Tenancy\Middleware\ResolveOrganizerContext::class,
    ]);

    $middleware->statefulApi(); // Laravel 11+ Sanctum helper (if available)
})
```

Aliases also documented in `config/tenancy.php` → `middleware` key (reference only; **register in `bootstrap/app.php`**).

### Recommended middleware order (API)

```
EnsureFrontendRequestsAreStateful  → session/cookies for SPA
SubstituteBindings
ResolveOrganizerContext            → sets OrganizerContext from user + membership
auth:sanctum                       → on protected routes
organizer                          → on tenant-only routes (future Organizer module)
```

### Checklist

- [ ] Sanctum stateful middleware on `api` group (required for login/session)
- [ ] `ResolveOrganizerContext` on `api` group
- [ ] `organizer` middleware applied only to routes requiring active tenant (not on `/auth/register`, `/auth/login`)
- [ ] CSRF / cookie config aligned with Next.js origin (see §6)

---

## Phase 5 — Route Loading Strategy

### Target URL structure

```
/api/v1/auth/login
/api/v1/auth/me
/api/v1/auth/organizer/switch
```

### ⚠️ Fix required: avoid double `/api` prefix

Laravel automatically prefixes routes in `routes/api.php` with `/api`.

**Current `routes/api.php` (incorrect after scaffold):**

```php
Route::prefix('api')->middleware('api')->group(...); // Would produce /api/api/v1/...
```

**Correct `routes/api.php`:**

```php
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->name('api.v1.')
    ->group(base_path('routes/api/v1.php'));
```

**`routes/api/v1.php` (load modules):**

```php
<?php

use Illuminate\Support\Facades\Route;

// Auth module
require base_path('app/Modules/Auth/routes/v1.php');

// Future modules:
// require base_path('app/Modules/Organizer/routes/v1.php');
```

**`bootstrap/app.php` routing:**

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    health: '/up',
)
```

### Named routes (verified)

| Route name | Used by |
|------------|---------|
| `api.v1.auth.verification.verify` | `VerifyEmailNotification` ✅ |
| `api.v1.auth.login` | Auth login |
| `api.v1.auth.me` | Current user |

Pattern: `api.v1.` (from v1 group) + `auth.` (from auth group) + route name.

### Route registration checklist

- [ ] Fix `routes/api.php` — remove extra `prefix('api')`
- [ ] `routes/api/v1.php` uses `require` for module route files
- [ ] `php artisan route:list --path=v1/auth` shows 12 auth routes
- [ ] Email verification signed URL generates correctly

---

## Phase 6 — Composer Autoload Requirements

### `composer.json` autoload section (required)

```json
{
  "name": "laristix/api",
  "type": "project",
  "require": {
    "php": "^8.3",
    "laravel/framework": "^12.0",
    "laravel/sanctum": "^4.0"
  },
  "autoload": {
    "psr-4": {
      "App\\": "app/",
      "Database\\Factories\\": "database/factories/",
      "Database\\Seeders\\": "database/seeders/"
    }
  },
  "autoload-dev": {
    "psr-4": {
      "Tests\\": "tests/"
    }
  }
}
```

### Checklist

- [ ] `"App\\": "app/"` covers `App\Core\` and `App\Modules\`
- [ ] `composer dump-autoload -o` completes
- [ ] No class in `app/Modules/Auth/docs/` with PHP namespace (see MODELS_REVIEW.md fix)

---

## Phase 7 — Environment Variables

### `.env.example` (minimum)

```dotenv
APP_NAME=Laristix
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://laristix.test
FRONTEND_URL=http://localhost:3000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laristix
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=cookie
SESSION_LIFETIME=120
SESSION_DOMAIN=laristix.test
SESSION_SECURE_COOKIE=false
SESSION_SAME_SITE=lax

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@laristix.test"
MAIL_FROM_NAME="${APP_NAME}"

# Sanctum SPA (Next.js)
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1,127.0.0.1:3000,laristix.test

# Auth module
AUTH_REQUIRE_EMAIL_VERIFICATION=true

# Tenancy
TENANCY_HEADER_HINT_ENABLED=true
TENANCY_SCOPE_ENABLED=true
```

### Post-copy commands

```bash
cp .env.example .env
php artisan key:generate
```

### Environment checklist

- [ ] `APP_KEY` generated
- [ ] `DB_*` matches Laragon MySQL
- [ ] `SANCTUM_STATEFUL_DOMAINS` includes Next.js origin
- [ ] `SESSION_DOMAIN` matches API cookie domain (or null for localhost)
- [ ] `FRONTEND_URL` used by password reset emails
- [ ] `MAIL_MAILER=log` for local dev (or SMTP for real emails)

---

## Phase 8 — Contract Bindings Verification

### Tenancy (`TenancyServiceProvider`)

| Contract | Implementation | Lifetime |
|----------|----------------|----------|
| `OrganizerContextInterface` | `OrganizerContext` | **scoped** |
| `OrganizerContext` | (concrete) | **scoped** |
| `OrganizerScope` | closure → `OrganizerScope` | singleton |
| `OrganizerMembershipValidatorInterface` | `OrganizerMembershipValidator` | singleton |
| `ActiveOrganizerServiceInterface` | `ActiveOrganizerService` | singleton |

### Auth (`AuthServiceProvider`)

| Contract | Implementation | Lifetime |
|----------|----------------|----------|
| `UserRepositoryInterface` | `UserRepository` | singleton |
| `UserRoleResolverInterface` | `UserRoleResolver` | singleton |
| `RegisterUserServiceInterface` | `RegisterUserService` | singleton |
| `PasswordResetServiceInterface` | `PasswordResetService` | singleton |
| `EmailVerificationServiceInterface` | `EmailVerificationService` | singleton |
| `PersonalAccessTokenServiceInterface` | `PersonalAccessTokenService` | singleton |
| `AuthServiceInterface` | `AuthService` | singleton |

### Cross-module dependencies (verified)

| Consumer | Depends on |
|----------|------------|
| `AuthService` | `ActiveOrganizerServiceInterface`, `OrganizerContextInterface`, `UserRepositoryInterface`, `UserRoleResolverInterface`, `PersonalAccessTokenServiceInterface` |
| `MeController` | `AuthServiceInterface`, `ActiveOrganizerServiceInterface`, `OrganizerContextInterface`, `OrganizerMembershipValidatorInterface` |
| `ResolveOrganizerContext` | `OrganizerContextInterface`, `ActiveOrganizerServiceInterface`, `OrganizerMembershipValidatorInterface` |
| `OrganizerScope` | `OrganizerContextInterface` |
| `HasOrganizer` trait | `OrganizerScope` via container |

### Binding checklist

- [ ] `php artisan tinker` → `app(OrganizerContextInterface::class)` resolves
- [ ] `app(AuthServiceInterface::class)` resolves
- [ ] No circular dependency errors on boot

---

## Phase 9 — Migration Dependency Order

**44 migrations** — sequential `000001`–`000044`. No circular FK dependencies.

| Batch | Migrations | Depends on |
|-------|------------|------------|
| 0 Foundation | 000001 users, 000002 password_reset_tokens, 000003 personal_access_tokens | — |
| 1 Tenant | 000004 organizers, 000005 organizer_members, 000006 organizer_fee_configs | users |
| 2 Platform | 000007 platform_settings, 000008 event_categories | users, organizers |
| 3 Events | 000009–000013 venues, events, schedules, media, sessions | organizers, users |
| 4 Forms & catalog | 000014–000018 forms, fields, options, ticket_types, promo_codes | events |
| 5 Discounts | 000019 coupons, 000020 referral_codes | users, organizers, events |
| 6 Orders | 000021–000024 orders, items, promo/coupon usages | orders, promos, coupons |
| 7 Registrations | 000025–000028 groups, registrations, answers, tickets | orders, forms |
| 8 Payments | 000029–000033 payments, logs, refunds, waitlists, referrals | orders |
| 9 Check-in | 000034–000035 gates, check_ins | tickets, users |
| 10 Logs & stats | 000036–000040 activity, audit, notification_logs, daily stats | organizers, events |
| 11 Extensions | 000041 event_staffs, 000042 ticket security fields | events, users, tickets |
| 12 Notifications | 000043 templates, 000044 jobs | organizers, events, notification_logs |

### Migration checklist

- [ ] Fresh DB: `php artisan migrate` completes without errors
- [ ] `personal_access_tokens` exists before Sanctum use
- [ ] `notification_logs` (000038) exists before `notification_jobs` (000044)
- [ ] Rollback test: `php artisan migrate:rollback --step=1` (optional)

---

## Phase 10 — Sanctum Integration Verification

### `config/auth.php` changes

```php
'defaults' => [
    'guard' => 'web',
    'passwords' => 'users',
],

'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],

'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => App\Modules\Auth\Models\User::class,
    ],
],
```

### `config/sanctum.php` highlights

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', '...')),
'guard' => ['web'],
'middleware' => [
    'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
    'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
    'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
],
```

### `config/cors.php`

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
'supports_credentials' => true,
```

### User model (verified)

- `HasApiTokens` trait ✅
- `MustVerifyEmail` interface ✅
- Table: `users` ✅
- Migration 000003: `personal_access_tokens` ✅

### Sanctum checklist

- [ ] `laravel/sanctum` installed
- [ ] `User` model path in `config/auth.php`
- [ ] `EnsureFrontendRequestsAreStateful` on API middleware group
- [ ] Next.js calls `GET /sanctum/csrf-cookie` before login
- [ ] Login via `POST /api/v1/auth/login` sets session cookie
- [ ] `POST /api/v1/auth/tokens` creates PAT for scanner apps
- [ ] Logout revokes session + current token

---

## Phase 11 — Tenancy Integration Verification

### Resolution flow (approved design)

```
Authenticated User
  → Session active_organizer_id (primary)
  → Optional X-Organizer-Id (hint, membership validated)
  → OrganizerMembershipValidator
  → OrganizerContext (request-scoped)
  → OrganizerScope on tenant models
```

### Models using `HasOrganizer` global scope

All tenant-scoped models except:

- **Excluded intentionally:** `OrganizerMember`, `Organizer`, `EventCategory`, `Coupon`, `ReferralCode`, `NotificationTemplate`, `NotificationJob`, `NotificationLog`, `ActivityLog`, `AuditLog`

### Tenancy checklist

- [ ] `TenancyServiceProvider` registered
- [ ] `OrganizerContext` is **scoped** (new instance per request)
- [ ] `ResolveOrganizerContext` runs on API group after auth
- [ ] `OrganizerMember` does **not** use `HasOrganizer` (cross-tenant membership queries)
- [ ] `POST /api/v1/auth/organizer/switch` updates session + context
- [ ] Super admin bypass on `/admin/*` routes (future)
- [ ] `TENANCY_SCOPE_ENABLED=true` in production

---

## Phase 12 — Exception Handler

Register custom handler in `bootstrap/app.php`:

```php
->withExceptions(function (Exceptions $exceptions) {
    // Option A: extend Laravel handler
})
```

Or replace `App\Exceptions\Handler` to extend `App\Core\Exceptions\Handler` for JSON domain errors.

### Handler checklist

- [ ] `InvalidCredentialsException` returns 422 + `INVALID_CREDENTIALS`
- [ ] `OrganizerMembershipRequiredException` returns 403 + `ORGANIZER_MEMBERSHIP_REQUIRED`
- [ ] JSON responses include `error_code` field

---

## Phase 13 — Pre-Run Command Sequence

Run in order after all checkboxes above:

```bash
# 1. Dependencies
composer install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Config
php artisan config:clear
php artisan cache:clear

# 4. Database
php artisan migrate

# 5. Verify routes
php artisan route:list --path=api/v1/auth

# 6. Verify bindings
php artisan about

# 7. Tests
php artisan test

# 8. Local server (Laragon) or:
php artisan serve
```

---

## Phase 14 — Post-Bootstrap Smoke Tests

| # | Test | Expected |
|---|------|----------|
| 1 | `GET /up` | 200 |
| 2 | `GET /sanctum/csrf-cookie` | 204 + cookies |
| 3 | `POST /api/v1/auth/register` | 201 |
| 4 | `POST /api/v1/auth/login` | 200 + session |
| 5 | `GET /api/v1/auth/me` | 200 + roles |
| 6 | `POST /api/v1/auth/logout` | 200 |

---

## Known Issues to Fix During Bootstrap

| # | Issue | Fix |
|---|-------|-----|
| 1 | Double `/api` prefix in `routes/api.php` | Remove `prefix('api')` — see §5 |
| 2 | `routes/api/v1.php` loads auth via `group(base_path(...))` | Prefer `require` for clarity |
| 3 | `MODELS_REVIEW.md` has PHP namespace | Convert to pure markdown |
| 4 | No `composer.json` / `artisan` | Complete Phase 1 scaffold |
| 5 | Laravel default `App\Models\User` | Remove or point auth to module User |
| 6 | `Core\Exceptions\Handler` not wired | Extend in bootstrap or `App\Exceptions\Handler` |
| 7 | Rate limits use string `5,1` | Valid for Laravel throttle middleware ✅ |

---

## Approval Gate

Do **not** start Organizer Module until:

- [ ] Phase 1 scaffold complete
- [ ] All Phase 2–11 checkboxes checked
- [ ] Phase 13 commands run successfully
- [ ] Phase 14 smoke tests pass
- [ ] This checklist reviewed and approved

---

**Document version:** 1.0  
**Last updated:** Bootstrap pre-flight for Laristix API  
**Next step after approval:** Execute Phase 1 Laravel 12 scaffold merge
