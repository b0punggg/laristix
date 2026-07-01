# Project Audit Report — Laristix Laravel Consolidation

**Audit date:** 2026-06-17  
**Auditor role:** Senior Laravel Architect / Refactoring Engineer  
**Workspace:** `C:\laragon\www\laristix`

---

## Executive Summary

The workspace contains **two Laravel 10.50.2 installations**, but only **one is the real application**. The nested `backend_laravel10_backup/` folder is an **unmodified stock Laravel 10 skeleton** copied during initial setup. All custom architecture (Core, Tenancy, Auth, Organizer models, 44 migrations, module routes, service providers) exists **only in the root `laristix/` project**.

**Recommendation:** Keep `C:\laragon\www\laristix` as the single source of truth. Archive/remove `backend_laravel10_backup/`.

**Git:** Root project has active git history (`1cc6742 inisiasi pertama program`). Backup folder is tracked inside the same repo (nested duplicate).

---

## A. Current Structure Map

### Root project — `laristix/` (ACTIVE APPLICATION)

```
laristix/
├── .env                          ✅ present (active)
├── .env.example                  ✅ present
├── .git/                         ✅ git root
├── app/
│   ├── Core/                     ✅ Tenancy, Exceptions, Providers, Support
│   ├── Modules/
│   │   ├── Auth/                 ✅ full module (47+ PHP files)
│   │   └── Organizer/Models/     ✅ minimal (Organizer, OrganizerMember)
│   ├── Shared/                   ⚠️ folder exists but empty (placeholders missing)
│   ├── Http/                     ✅ Kernel, Middleware (Laravel default + tenancy wiring)
│   ├── Exceptions/Handler.php    ✅ domain JSON exception handling
│   └── Providers/                ✅ App, Route, Event, Auth (Laravel default)
├── bootstrap/                    ✅ Laravel 10 bootstrap
├── config/
│   ├── app.php                   ✅ TenancyServiceProvider + AuthServiceProvider registered
│   ├── auth.php                  ✅ points to App\Modules\Auth\Models\User
│   ├── auth_module.php           ✅ custom
│   └── tenancy.php               ✅ custom
├── database/
│   └── migrations/               ✅ 000001–000044 (44 custom migrations)
├── public/                       ✅
├── routes/
│   ├── api.php                   ✅ loads v1
│   ├── api/v1.php                ✅ loads Auth module routes
│   ├── web.php, console.php, channels.php ✅
├── storage/                      ✅
├── tests/                        ✅
├── vendor/                       ✅ Laravel 10.50.2
├── artisan, composer.json, composer.lock ✅
├── backend_laravel10_backup/     ❌ NESTED DUPLICATE (should not exist)
├── resources/                    ❌ MISSING
├── database/factories/           ❌ MISSING
├── database/seeders/             ❌ MISSING
├── .gitignore                    ❌ MISSING
├── package.json / vite.config.js ❌ MISSING (frontend tooling)
└── docs: LARAVEL_10_COMPATIBILITY_REPORT.md, MIGRATION_CONSTRAINT_RENAMES.md, PRE-RUN CHECKLIST.md
```

### Nested backup — `laristix/backend_laravel10_backup/` (STOCK SKELETON)

```
backend_laravel10_backup/
├── app/                          stock only (19 PHP files, default User model)
├── bootstrap/, config/, public/, routes/, storage/, tests/, vendor/
├── database/migrations/          4 default Laravel migrations only (2014/2019 dated)
├── resources/                    ✅ stock views (welcome.blade.php)
├── database/factories/, seeders/ ✅ stock
├── .env                          duplicate copy (not authoritative)
├── package.json, vite.config.js  ✅ stock
└── NO Core/, Modules/, custom migrations, tenancy, or auth module
```

---

## B. Duplicate Files List

These paths exist in **both** installations with **overlapping Laravel skeleton** content:

| Path pattern | Main | Backup | Notes |
|--------------|------|--------|-------|
| `artisan` | ✅ | ✅ | Identical purpose; keep main only |
| `bootstrap/app.php` | ✅ | ✅ | Laravel 10 default |
| `composer.json` | ✅ | ✅ | **Identical** dependencies |
| `composer.lock` | ✅ | ✅ | Both lock **laravel/framework 10.50.2** |
| `config/*.php` (15 files) | ✅ | ✅ | Backup lacks `auth_module.php`, `tenancy.php` |
| `app/Http/Kernel.php` | ✅ customized | ✅ stock | **Different** — main has Sanctum + tenancy |
| `app/Providers/AppServiceProvider.php` | ✅ Sanctum::ignoreMigrations() | ✅ empty | **Different** |
| `routes/api.php` | ✅ custom v1 loader | ✅ stock | **Different** |
| `routes/web.php` | ✅ | ✅ | Similar |
| `public/index.php` | ✅ | ✅ | Duplicate |
| `vendor/` | ✅ ~full tree | ✅ ~full tree | **~2× disk usage** nested inside repo |
| `.env` | ✅ authoritative | ✅ copy | Keep main `.env` only |

**Not duplicated (main only):**

- `app/Core/**` (23 files)
- `app/Modules/Auth/**` (51 files)
- `app/Modules/Organizer/Models/**` (2 files)
- `database/migrations/000001–000044` (44 files)
- `config/auth_module.php`, `config/tenancy.php`
- `routes/api/v1.php`
- Architecture documentation (3 root MD files)

---

## C. Missing Files List (in main, present in backup or required)

| Item | Severity | Source to restore |
|------|----------|-------------------|
| `resources/` (views, js, css) | **High** — `web` route returns `view('welcome')` | Copy from backup skeleton |
| `database/factories/UserFactory.php` | Medium | Copy from backup |
| `database/seeders/DatabaseSeeder.php` | Medium | Copy from backup |
| `.gitignore` | **High** — repo hygiene | Copy from backup |
| `.gitattributes` | Low | Copy from backup |
| `.editorconfig` | Low | Copy from backup |
| `package.json` | Low (future frontend) | Copy from backup |
| `vite.config.js` | Low | Copy from backup |
| `app/Shared/Contracts/.gitkeep` | Low | Recreate placeholder |
| `app/Shared/DTOs/.gitkeep` | Low | Recreate placeholder |
| Root `README.md` | Low | Optional from backup |

**Not missing (already in main):** all architecture, migrations, tenancy, auth, service provider wiring.

---

## D. Which Project Should Be Kept

### ✅ KEEP: `C:\laragon\www\laristix` (root)

Evidence:

| Capability | Root | Backup |
|------------|------|--------|
| Core/Tenancy layer | ✅ 23 files | ❌ |
| Auth module | ✅ complete | ❌ |
| Organizer models | ✅ 2 files | ❌ |
| Custom migrations 000001–044 | ✅ 44 files | ❌ |
| Custom config (tenancy, auth_module) | ✅ | ❌ |
| Service providers wired | ✅ | ❌ |
| API v1 Auth routes (12 endpoints) | ✅ | ❌ |
| Migrations ran successfully | ✅ all 44 batch [1] | N/A |
| Git history | ✅ | nested only |
| Sanctum duplicate fix | ✅ `ignoreMigrations()` | ❌ |

---

## E. Which Project Should Be Archived

### 🗄️ ARCHIVE: `C:\laragon\www\laristix\backend_laravel10_backup`

- Stock Laravel 10.50.2 installer copy
- No business logic or custom architecture
- Contains redundant `vendor/` (~tens of MB)
- Causes confusion about which `artisan`, `.env`, and migrations are authoritative
- **Safe to remove** after extracting skeleton files (`resources/`, factories, seeders, dotfiles)

**Archive action:** Move to `C:\laragon\www\laristix_archive\backend_laravel10_backup` (outside active project) or delete after skeleton merge.

---

## F. Migration Consistency Report

| Location | Count | Files |
|----------|------:|-------|
| `laristix/database/migrations/` | **44** | `000001`–`000044` custom sequential |
| `backend_laravel10_backup/database/migrations/` | **4** | `2014_*`, `2019_*` Laravel defaults |

**Main project migration status (verified):** All 44 migrations **Ran** in batch [1].

**Conflicts:** None between custom 000001–044. Sanctum vendor migration conflict **resolved** in main via `Sanctum::ignoreMigrations()` (000003 owns `personal_access_tokens`).

**Constraint naming:** Short explicit names applied per `MIGRATION_CONSTRAINT_RENAMES.md`.

---

## G. Route Consistency Report

### Main project

| File | Purpose |
|------|---------|
| `routes/api.php` | Prefix `v1`, name `api.v1.` |
| `routes/api/v1.php` | Loads `app/Modules/Auth/routes/v1.php` |
| `app/Modules/Auth/routes/v1.php` | 12 auth endpoints |

**Registered API v1 routes (verified via bootstrap):**

```
POST   api/v1/auth/register
POST   api/v1/auth/login
POST   api/v1/auth/forgot-password
POST   api/v1/auth/reset-password
GET    api/v1/auth/email/verify/{id}/{hash}
POST   api/v1/auth/logout
POST   api/v1/auth/email/verification-notification
GET    api/v1/auth/me
GET    api/v1/auth/organizers
POST   api/v1/auth/organizer/switch
POST   api/v1/auth/tokens
DELETE api/v1/auth/tokens/current
```

### Backup project

- `routes/api.php` — stock stub only
- No `routes/api/v1.php`
- No module routes

**Note:** `php artisan route:list` fails on Windows shell (exit 255, no output) but routes bootstrap correctly via PHP.

---

## H. Service Provider Consistency Report

### `config/app.php` providers (main)

| Provider | Status |
|----------|--------|
| `App\Providers\AppServiceProvider` | ✅ + `Sanctum::ignoreMigrations()` |
| `App\Providers\AuthServiceProvider` | ✅ Laravel default (Gates) |
| `App\Core\Providers\TenancyServiceProvider` | ✅ custom |
| `App\Modules\Auth\Providers\AuthServiceProvider` | ✅ custom |
| `App\Providers\EventServiceProvider` | ✅ |
| `App\Providers\RouteServiceProvider` | ✅ |

### Backup

- Only Laravel default providers
- No TenancyServiceProvider
- No Modules\Auth\AuthServiceProvider

### HTTP Kernel (main only customizations)

- `EnsureFrontendRequestsAreStateful` on `api` group
- `ResolveOrganizerContext` on `api` group
- Aliases: `resolve.organizer`, `organizer.context`

---

## I. Composer Dependency Consistency Report

| Package | Main `composer.lock` | Backup `composer.lock` |
|---------|---------------------|-------------------------|
| `laravel/framework` | **10.50.2** | **10.50.2** |
| `laravel/sanctum` | ^3.3 | ^3.3 |
| PHP requirement | ^8.1 | ^8.1 |

`composer.json` files are **identical** between both installations.

**Dependency resolution:** Use root `laristix/vendor/` only. Nested backup `vendor/` is redundant.

---

## J. Exact Consolidation Plan

### Phase 2 steps (approved to execute)

1. **Copy skeleton assets** from backup → main (non-destructive):
   - `resources/` → `laristix/resources/`
   - `database/factories/` → `laristix/database/factories/`
   - `database/seeders/` → `laristix/database/seeders/`
   - `.gitignore`, `.gitattributes`, `.editorconfig`
   - `package.json`, `vite.config.js`

2. **Recreate placeholders:**
   - `app/Shared/Contracts/.gitkeep`
   - `app/Shared/DTOs/.gitkeep`

3. **Update `.gitignore`** to exclude archive path if kept locally.

4. **Archive nested backup:**
   - Move `backend_laravel10_backup/` → `C:\laragon\www\laristix_archive\backend_laravel10_backup`
   - OR delete if move not possible (after skeleton extracted)

5. **Preserve without change:**
   - `.env` (root)
   - `composer.json` / `composer.lock`
   - `vendor/` (root)
   - All `app/Core/`, `app/Modules/`
   - All `database/migrations/000001–000044`
   - Git history at root

6. **Verify:**
   - `php artisan about`
   - Route bootstrap count (12 api/v1 routes)
   - `php artisan migrate:status`

### Conflicts requiring manual decision

| Conflict | Resolution |
|----------|------------|
| None blocking | Consolidation can proceed automatically |
| `route:list` Windows CLI bug | Use PHP bootstrap or Laragon terminal; not a code issue |
| `UserFactory` references `App\Models\User` | Update factory to `App\Modules\Auth\Models\User` after copy |

---

## Module Inventory (main project only)

### Core (`app/Core/`) — 23 PHP files

- `Exceptions/DomainException.php`
- `Http/Controllers/Controller.php`
- `Providers/TenancyServiceProvider.php`
- `Support/Traits/HasOrganizer.php`, `HasUuid.php`
- `Tenancy/Contracts/` (4), `Exceptions/` (6), `Middleware/` (2), `Scopes/` (1), `Services/` (3)

### Auth (`app/Modules/Auth/`) — 51 PHP files

- Contracts, DTOs, Enums, Exceptions, Http (Controllers, Requests, Resources), Models, Notifications, Providers, Repositories, Services, routes

### Organizer (`app/Modules/Organizer/`) — 2 PHP files

- `Models/Organizer.php`, `OrganizerMember.php`

### Shared (`app/Shared/`) — placeholders only (to be restored)

---

## Audit Conclusion

**No architecture is split across both projects.** The inconsistency is caused by leaving a full stock Laravel copy inside the active repo. Consolidation is low-risk: merge skeleton files, remove nested backup, verify boot.

**Proceed to Phase 2 consolidation.**
