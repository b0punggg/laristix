# Auth Module — Security Practices

## Authentication

- Passwords hashed via `hashed` cast (bcrypt/argon per Laravel config)
- `Password::defaults()` enforces minimum complexity on register/reset
- Session regeneration on login (`auth_module.session.regenerate_on_login`)
- Full session invalidate on logout

## Rate limiting (per IP)

| Endpoint | Limit |
|----------|-------|
| Register | 3/minute |
| Login | 5/minute |
| Forgot password | 3/minute |
| Reset password | 5/minute |
| Verify email | 6/minute |
| Switch organizer | 10/minute |

## Account protection

- Login blocked for `status !== active`
- Optional email verification gate before login (`AUTH_REQUIRE_EMAIL_VERIFICATION`)
- Generic login error message (no email existence leak)
- Forgot password always returns same success message

## Sanctum

- Stateful domains configured for Next.js SPA (`SANCTUM_STATEFUL_DOMAINS`)
- PAT abilities scoped; scanner tokens limited to check-in abilities
- Token expiry default 90 days
- Logout revokes current PAT if present

## Email verification

- Signed temporary URLs with expiry
- Hash validated against email SHA1

## Organizer switching

- Membership validated via `OrganizerMembershipValidator` (not headers alone)
- Session `active_organizer_id` updated only after validation

## Audit (recommended next step)

- Log failed logins, password resets, organizer switches to `audit_logs`
