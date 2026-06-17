# Core Tenancy Layer — Unit Test Strategy

## Scope

Tests live under `tests/Unit/Core/Tenancy/` and `tests/Feature/Core/Tenancy/`.

## Unit tests (no HTTP)

| Class | Cases |
|-------|--------|
| `OrganizerContext` | set/clear/has; requireOrganizerId throws; requireMembership throws; role() |
| `OrganizerMembershipValidator` | active membership found; missing membership throws; inactive organizer throws |
| `ActiveOrganizerService` | session read/write; invalid session cleared; single-org auto-select; switch validates membership; resolveOrganizerId rejects non-member header hint |
| `OrganizerScope` | applies filter when context set; no filter when context empty; disabled via config |

## Feature tests (HTTP, after Laravel scaffold)

| Scenario | Expected |
|----------|----------|
| Authenticated user with session organizer | Context set; scoped queries filtered |
| User without membership | 403 + `ORGANIZER_MEMBERSHIP_REQUIRED` |
| Header hint without membership | 403 + `ORGANIZER_ACCESS_DENIED` |
| Header hint matching session | Context set |
| Super admin on `/admin/*` | Context bypassed |
| `EnsureOrganizerContext` on dashboard route | 401 without context |

## Test doubles

- Mock `Session` for `ActiveOrganizerService`
- Use `Organizer::factory()` / `OrganizerMember::factory()` once factories exist
- Always query `OrganizerMember` without global scope in test setup

## Isolation tests (CI required)

- User A cannot read User B organizer events when context is organizer A
- Assert 404/403 on cross-tenant ID access (never leak row existence)

## Running

```bash
php artisan test --filter=Tenancy
```
