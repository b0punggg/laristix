# Auth API Routes (`/api/v1/auth`)

| Method | Path | Auth | Rate limit | Description |
|--------|------|------|------------|-------------|
| POST | `/register` | Guest | 3/min | Register participant account |
| POST | `/login` | Guest | 5/min | Session login (Sanctum SPA) |
| POST | `/logout` | Sanctum | — | Logout + invalidate session |
| POST | `/forgot-password` | Guest | 3/min | Send reset link |
| POST | `/reset-password` | Guest | 5/min | Reset password with token |
| GET | `/email/verify/{id}/{hash}` | Signed URL | 6/min | Verify email |
| POST | `/email/verification-notification` | Sanctum | 6/min | Resend verification |
| GET | `/me` | Sanctum | — | Current user + roles + active organizer |
| GET | `/organizers` | Sanctum | — | List accessible organizers |
| POST | `/organizer/switch` | Sanctum | 10/min | Switch active organizer session |
| POST | `/tokens` | Sanctum | — | Create personal access token |
| DELETE | `/tokens/current` | Sanctum | — | Revoke current token |

## Middleware stack (authenticated routes)

```
auth:sanctum → ResolveOrganizerContext (global api group recommended)
```

Register `ResolveOrganizerContext` on `api` middleware group when scaffolding Laravel.

## Example payloads

**Register**
```json
{ "name": "Jane", "email": "jane@example.com", "password": "secret", "password_confirmation": "secret" }
```

**Login**
```json
{ "email": "jane@example.com", "password": "secret", "remember": true }
```

**Switch organizer**
```json
{ "organizer_id": 1 }
```
