# Authentication Module Architecture

## Stack

| Component | Implementation |
|-----------|----------------|
| SPA session auth | Laravel Sanctum (`auth:sanctum`, stateful domains) |
| API tokens | Sanctum `personal_access_tokens` (scanner / future mobile) |
| Email verification | `MustVerifyEmail` + signed verification URLs |
| Password reset | Laravel `Password` broker + throttled reset tokens |

## Role model (two layers)

### Platform layer (`users.platform_role`)

| Value | Maps to |
|-------|---------|
| `super_admin` | `UserRole::SuperAdmin` |
| `user` | Base participant (may also hold organizer roles) |

### Organizer layer (`organizer_members.role`)

| DB value | Maps to |
|----------|---------|
| `owner` | `UserRole::OrganizerOwner` |
| `admin` | `UserRole::OrganizerAdmin` |
| `staff` | `UserRole::OrganizerStaff` |
| `scanner` | `UserRole::EventScanner` |

### Event layer (future enforcement)

`event_staffs.role` refines scanner/staff per event — resolved in CheckIn module.

### Participant

User with no active organizer membership (or attendee-only activity via orders) → `UserRole::Participant`.

## Request flow

```
POST /api/v1/auth/login
  → LoginRequest validation
  → AuthService::login()
  → Session regenerate
  → Optional ActiveOrganizerService auto-select

GET /api/v1/auth/me
  → auth:sanctum
  → ResolveOrganizerContext (membership + session)
  → MeResource (user, roles, active organizer)

POST /api/v1/auth/organizer/switch
  → auth:sanctum
  → ActiveOrganizerService::switch()
  → ResolveOrganizerContext refreshes on next request
```

## Security

- Bcrypt/argon password hashing via model cast
- Rate limiting on all auth endpoints
- Session regeneration on login
- Logout invalidates session + revokes current token if present
- Account `status` checked on login (`active` only)
- Email verification gate when `AUTH_REQUIRE_EMAIL_VERIFICATION=true`
- Generic error messages on login failure (no user enumeration on forgot password)
- PAT abilities scoped; scanner tokens limited abilities

## Module boundaries

Auth owns: registration, credentials, verification, reset, me, organizer list/switch for session.
Tenancy owns: `OrganizerContext`, membership validation, active organizer session key.
Organizer module owns: creating organizers and inviting members (future).
