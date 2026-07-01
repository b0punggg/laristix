# Authentication Module — Full Stack

Sanctum session auth + Spatie Permission roles.

## Features

| Feature | Endpoint | Service |
|---------|----------|---------|
| Register | `POST /api/v1/auth/register` | `RegisterUserService` |
| Login | `POST /api/v1/auth/login` | `AuthService` |
| Logout | `POST /api/v1/auth/logout` | `AuthService` |
| Forgot password | `POST /api/v1/auth/forgot-password` | `PasswordResetService` |
| Reset password | `POST /api/v1/auth/reset-password` | `PasswordResetService` |
| Resend verification | `POST /api/v1/auth/email/verification-notification` | `EmailVerificationService` |
| Verify email | `GET /api/v1/auth/email/verify/{id}/{hash}` | `EmailVerificationService` |
| Me | `GET /api/v1/auth/me` | `AuthService` |

## Roles (Spatie Permission)

| Role | Assigned when |
|------|----------------|
| `super_admin` | `users.platform_role = super_admin` |
| `organizer` | Active `organizer_members` row with `owner` or `admin` |
| `staff` | Active membership with `staff` or `scanner` |
| `participant` | Default on register; no active organizer membership |

Roles are synced on `/me`, login, and organizer switch via `RoleService`.

## Layer map

```
database/migrations/000001..000003, 000045  →  tables
app/Modules/Auth/Models/User.php            →  model + HasRoles + Sanctum
app/Modules/Auth/Repositories/            →  UserRepository, RoleRepository
app/Modules/Auth/Services/                →  Auth, Register, PasswordReset, EmailVerification, Role
app/Modules/Auth/Http/Controllers/V1/     →  Auth, PasswordReset, EmailVerification, Me
app/Modules/Auth/routes/v1.php            →  API routes
database/seeders/AuthRoleSeeder.php       →  seeds Spatie roles
```

## Setup

```bash
composer install
php artisan migrate
php artisan db:seed --class=AuthRoleSeeder
```

## Spatie config

Published to `config/permission.php`. Guard: `web` (matches Sanctum SPA session).
