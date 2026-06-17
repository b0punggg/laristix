# Core Tenancy Layer — Error Handling Strategy

## Exception hierarchy

```
DomainException (abstract)
└── TenancyException
    ├── OrganizerContextRequiredException   (401, ORGANIZER_CONTEXT_REQUIRED)
    ├── OrganizerMembershipRequiredException (403, ORGANIZER_MEMBERSHIP_REQUIRED)
    ├── InactiveOrganizerException          (403, ORGANIZER_INACTIVE)
    └── OrganizerAccessDeniedException      (403, ORGANIZER_ACCESS_DENIED)
```

## JSON response shape

```json
{
  "message": "Human-readable message",
  "error_code": "ORGANIZER_MEMBERSHIP_REQUIRED",
  "context": { "user_id": 1, "organizer_id": 99 }
}
```

Rendered by `App\Core\Exceptions\Handler` when `$request->expectsJson()`.

## When each exception is thrown

| Exception | Trigger |
|-----------|---------|
| `OrganizerMembershipRequiredException` | User has no active `organizer_members` row for resolved organizer |
| `InactiveOrganizerException` | Organizer `status` not in `accessible_organizer_statuses` |
| `OrganizerAccessDeniedException` | Invalid header hint; organizer not found; header/user mismatch |
| `OrganizerContextRequiredException` | `EnsureOrganizerContext` middleware; `requireOrganizerId()` in services |

## Security rules

- Cross-tenant access returns **403** with membership/access codes (not 404) during context resolution
- Resource policies may still return **404** for ID enumeration on entity routes (implemented later)
- Never expose internal organizer IDs in public endpoints without auth

## Logging

- Log `OrganizerAccessDeniedException` and `OrganizerMembershipRequiredException` at `warning` with `user_id`, `organizer_id`, `ip`
- Log `InactiveOrganizerException` at `info`
- Do not log full session tokens

## Middleware order (when registered)

```
auth:sanctum → ResolveOrganizerContext → EnsureOrganizerContext (tenant routes only)
```

`ResolveOrganizerContext` always clears context at request start to prevent leakage across requests.
