# Auth Module — Unit Test Strategy

## Unit tests (`tests/Unit/Modules/Auth/`)

| Target | Cases |
|--------|--------|
| `UserRoleResolver` | super admin; owner/admin/staff/scanner mapping; participant fallback |
| `AuthService` | login success; invalid credentials; suspended account; unverified email |
| `PasswordResetService` | sends reset link; throttled broker |
| `RegisterUserService` | creates user; hashes password; fires registered event |

## Feature tests (`tests/Feature/Modules/Auth/`)

| Endpoint | Cases |
|----------|--------|
| `POST /auth/register` | 201; validation errors; rate limit |
| `POST /auth/login` | 200 + session cookie; 422 invalid; 403 suspended |
| `POST /auth/logout` | 204; session cleared |
| `POST /auth/forgot-password` | 200 always (no enumeration) |
| `POST /auth/reset-password` | 200 valid token; 422 invalid token |
| `GET /auth/me` | 401 guest; 200 with roles |
| `GET /auth/organizers` | lists memberships only |
| `POST /auth/organizer/switch` | 403 non-member; 200 sets session |

## Mocks

- `UserRepository` interface in service tests
- `Notification` fake for verification / reset emails
- `Session` fake for organizer switch integration with tenancy

## CI

```bash
php artisan test --filter=Auth
```
