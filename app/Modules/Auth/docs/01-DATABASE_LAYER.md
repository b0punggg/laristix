# Authentication Module — Step 1: Database Layer

Generate order: **Migration → Model → Relationships**

This module owns identity, credentials, and Sanctum tokens. Organizer membership rows live in the Organizer module but are linked here via `user_id`.

---

## Step 1 — Migrations

Auth-related tables (project root `database/migrations/`):

| File | Table | Purpose |
|------|-------|---------|
| `000001_create_users_table.php` | `users` | Platform accounts |
| `000002_create_password_reset_tokens_table.php` | `password_reset_tokens` | Password reset broker |
| `000003_create_personal_access_tokens_table.php` | `personal_access_tokens` | Sanctum PAT / scanner tokens |

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint PK | |
| `uuid` | uuid, unique | Public identifier |
| `name` | string | |
| `email` | string, unique | Login identifier |
| `email_verified_at` | timestamp, nullable | `MustVerifyEmail` gate |
| `password` | string | Hashed via model cast |
| `phone` | string(30), nullable | |
| `avatar_url` | string(500), nullable | |
| `platform_role` | enum `user`, `super_admin` | Platform-level role |
| `status` | enum `active`, `suspended`, `deleted` | Login allowed when `active` |
| `last_login_at` | timestamp, nullable | |
| `remember_token` | string, nullable | Session “remember me” |
| `timestamps` | | |
| `deleted_at` | soft delete | |

Indexes: `idx_users_status`, `uniq_users_uuid`, `uniq_users_email`

### `password_reset_tokens`

| Column | Type |
|--------|------|
| `email` | string PK |
| `token` | string |
| `created_at` | timestamp, nullable |

### `personal_access_tokens` (Sanctum)

| Column | Type |
|--------|------|
| `id` | bigint PK |
| `tokenable_type` / `tokenable_id` | morph → `User` |
| `name` | string |
| `token` | string(64), unique |
| `abilities` | text, nullable |
| `last_used_at` | timestamp, nullable |
| `expires_at` | timestamp, nullable |
| `timestamps` | |

Run:

```bash
php artisan migrate
```

---

## Step 2 — Model

**File:** `app/Modules/Auth/Models/User.php`

| Concern | Implementation |
|---------|----------------|
| Base | `Authenticatable` |
| Email verification | `MustVerifyEmail` |
| Traits | `HasApiTokens`, `HasFactory`, `HasUuid`, `Notifiable`, `SoftDeletes` |
| Factory | `Database\Factories\UserFactory` via `newFactory()` |
| Table | `users` (default) |

### Fillable

`uuid`, `name`, `email`, `password`, `phone`, `avatar_url`, `platform_role`, `status`, `last_login_at`, `email_verified_at`

### Casts

- `email_verified_at`, `last_login_at` → datetime
- `password` → `hashed`

### Helpers

- `isSuperAdmin()` — `platform_role === super_admin`
- `isActive()` — `status === active`
- `isParticipant()` — platform `user` with no active organizer memberships
- `sendEmailVerificationNotification()` — custom notification

**Sanctum** does not need a custom `PersonalAccessToken` model; the default morph on `User` is sufficient.

---

## Step 3 — Relationships

### Owned by Auth (on `User`)

| Method | Type | Target | Notes |
|--------|------|--------|-------|
| `tokens()` | morphMany | `personal_access_tokens` | From `HasApiTokens` |
| `organizerMembers()` | hasMany | `OrganizerMember` | All memberships |
| `activeOrganizerMembers()` | hasMany | `OrganizerMember` | `status = active` |
| `organizers()` | belongsToMany | `Organizer` | Via `organizer_members` pivot |
| `activeOrganizers()` | belongsToMany | `Organizer` | Pivot `status = active` |
| `sentOrganizerInvitations()` | hasMany | `OrganizerMember` | FK `invited_by` |

### Inverse (Organizer module, already defined)

| Model | Method | Target |
|-------|--------|--------|
| `OrganizerMember` | `user()` | `User` |
| `OrganizerMember` | `invitedBy()` | `User` |

### Deferred (other modules — add when those models exist)

| Method | Module | Table |
|--------|--------|-------|
| `orders()` | Order | `orders.user_id` |
| `eventStaffs()` | Event | `event_staffs.user_id` |
| `checkIns()` | CheckIn | `check_ins.scanned_by` |

---

## ER diagram (Auth scope)

```
users
  ├── 1:N  organizer_members (user_id)
  ├── 1:N  organizer_members (invited_by)
  ├── N:M  organizers ── organizer_members ──
  └── morph  personal_access_tokens (tokenable)

password_reset_tokens (email → users.email, no FK)
```

---

## Next steps (not in this phase)

- Services, HTTP controllers, routes (already scaffolded in this repo)
- Organizer module: full CRUD + invitations
- Event / Order relationships on `User`
