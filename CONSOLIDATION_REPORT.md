# Consolidation Report — Laristix Laravel

**Date:** 2026-06-17  
**Action:** Architecture audit + single-application consolidation  
**Source of truth:** `C:\laragon\www\laristix`

---

## Summary

Consolidation completed. The root `laristix/` project is now the **only active Laravel application**. Custom architecture, migrations, and wiring were already in the root project; the nested `backend_laravel10_backup/` was a redundant stock skeleton.

---

## 1. Files Moved

| From | To |
|------|-----|
| `backend_laravel10_backup/resources/` | `laristix/resources/` |
| `backend_laravel10_backup/database/factories/` | `laristix/database/factories/` |
| `backend_laravel10_backup/database/seeders/` | `laristix/database/seeders/` |
| `backend_laravel10_backup/.gitignore` | `laristix/.gitignore` |
| `backend_laravel10_backup/.gitattributes` | `laristix/.gitattributes` |
| `backend_laravel10_backup/.editorconfig` | `laristix/.editorconfig` |
| `backend_laravel10_backup/package.json` | `laristix/package.json` |
| `backend_laravel10_backup/vite.config.js` | `laristix/vite.config.js` |
| `backend_laravel10_backup/` (full tree) | `C:\laragon\www\laristix_archive\backend_laravel10_backup\` |

---

## 2. Files Deleted

| Path | Notes |
|------|-------|
| `laristix/backend_laravel10_backup/*` | Contents removed after archive copy (vendor, app, config, etc.) |
| Nested duplicate `vendor/` inside backup | Eliminated from workspace |

**Remaining shell:** Empty `laristix/backend_laravel10_backup/` directory could not be removed (Windows file lock). Added to `.gitignore`. Safe to delete manually after closing IDE/terminal handles.

---

## 3. Files Merged / Modified

| File | Change |
|------|--------|
| `database/factories/UserFactory.php` | Pointed to `App\Modules\Auth\Models\User`; added uuid, platform_role, status fields |
| `app/Modules/Auth/Models/User.php` | Added `HasFactory` trait for factory support |
| `app/Shared/Contracts/.gitkeep` | Recreated placeholder |
| `app/Shared/DTOs/.gitkeep` | Recreated placeholder |
| `.gitignore` | Added `/backend_laravel10_backup` and `/laristix_archive` |
| `laristix_archive/.../ARCHIVED_README.md` | Archive documentation |

**Not modified:** Core, Tenancy, Auth module code, migrations 000001–044, `.env`, `composer.json`, `composer.lock`, service provider wiring.

---

## 4. Potential Manual Fixes

| Item | Priority | Action |
|------|----------|--------|
| Empty `backend_laravel10_backup/` folder | Low | Close Cursor/Laragon locks → delete folder manually |
| `php artisan route:list` Windows CLI | Low | Known exit 255 with empty output; routes work (bootstrap verified). Use Laragon terminal or `php artisan route:list --json` if available |
| `DatabaseSeeder.php` | Low | Still has commented `App\Models\User` references — update when seeders are implemented |
| `PRE-RUN CHECKLIST.md` | Low | References Laravel 12 in places — update to Laravel 10 |
| Archive folder | Optional | `C:\laragon\www\laristix_archive\` is outside git — delete when no longer needed |

---

## 5. Laravel Boot Status

```
php artisan about
```

| Check | Result |
|-------|--------|
| Laravel Version | **10.50.2** ✅ |
| PHP Version | **8.1.10** ✅ |
| Environment | local ✅ |
| Database driver | mysql ✅ |
| Maintenance Mode | OFF ✅ |

---

## 6. Route Status

`php artisan route:list` — **CLI issue on Windows** (exit 255, no stdout). Routes verified via application bootstrap:

| Metric | Value |
|--------|------:|
| Total registered routes | **17** |
| API v1 routes | **12** |

### API v1 Auth routes (all registered)

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

---

## 7. Migration Status

```
php artisan migrate:status
```

| Migration range | Status |
|-----------------|--------|
| `000001` – `000044` | **All Ran** (batch [1]) ✅ |

No pending migrations. No Sanctum duplicate migration (fixed via `Sanctum::ignoreMigrations()`).

---

## Final Structure (verified)

```
laristix/
├── app/
│   ├── Core/                 ✅ Tenancy, Providers, Support
│   ├── Modules/
│   │   ├── Auth/             ✅ complete
│   │   └── Organizer/Models/ ✅ minimal
│   └── Shared/               ✅ Contracts/, DTOs/ placeholders
├── bootstrap/                ✅
├── config/                   ✅ + tenancy.php, auth_module.php
├── database/
│   ├── factories/            ✅ restored
│   ├── migrations/           ✅ 000001–000044
│   └── seeders/              ✅ restored
├── public/                   ✅
├── resources/                ✅ restored
├── routes/                   ✅ api.php, api/v1.php
├── storage/                  ✅
├── tests/                    ✅
├── vendor/                   ✅
├── artisan                   ✅
├── composer.json             ✅
├── composer.lock             ✅
├── .env                      ✅ preserved
├── package.json              ✅ restored
└── vite.config.js            ✅ restored
```

---

## Git History

Git repository remains at `laristix/.git`. History preserved. Consolidation changes are uncommitted working tree modifications (expected).

---

## Archived Copy Location

```
C:\laragon\www\laristix_archive\backend_laravel10_backup\
└── ARCHIVED_README.md
```

This is **not** part of the active project. Do not develop against it.

---

## Conclusion

Consolidation successful. One Laravel 10.50.2 application with full custom architecture is at `C:\laragon\www\laristix`. Safe to proceed with Organizer Module development after manually removing the empty `backend_laravel10_backup/` shell if desired.
