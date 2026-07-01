# Auth Models Review

## `User` — `app/Modules/Auth/Models/User.php`

| Aspect | Detail |
|--------|--------|
| Interfaces | `MustVerifyEmail`, `Authenticatable` |
| Traits | `HasApiTokens`, `HasFactory`, `HasUuid`, `Notifiable`, `SoftDeletes`, `HasRoles` (Spatie) |
| Table | `users` |
| Platform role | `platform_role`: `user` \| `super_admin` |
| Status | `active` \| `suspended` \| `deleted` — only `active` may login |

### Relations

| Relation | Model | Notes |
|----------|-------|-------|
| `organizerMembers()` | `OrganizerMember` | All memberships |
| `activeOrganizerMembers()` | `OrganizerMember` | `status = active` |
| `organizers()` | `Organizer` | `belongsToMany` via `organizer_members` |
| `activeOrganizers()` | `Organizer` | Pivot `status = active` |
| `sentOrganizerInvitations()` | `OrganizerMember` | FK `invited_by` |
| `tokens()` | Sanctum PAT | From `HasApiTokens` |
| `roles` / `permissions` | Spatie | From `HasRoles` |
| `eventStaffs()` | `EventStaff` | *Deferred — Event module* |
| `orders()` | `Order` | *Deferred — Order module* |
| `checkIns()` | `CheckIn` | *Deferred — CheckIn module* |

### Hidden / casts

- Hidden: `password`, `remember_token`
- Casts: `email_verified_at`, `last_login_at` (datetime), `password` (hashed)

### Helpers

- `isSuperAdmin()` — `platform_role === super_admin`
- `isParticipant()` — platform user with no active organizer memberships
- `sendEmailVerificationNotification()` — custom queued notification

### Role mapping (not stored on user)

Organizer roles live on `organizer_members.role` → resolved by `UserRoleResolver`.

| DB value | Application role (Spatie) |
|----------|---------------------------|
| `owner`, `admin` | `organizer` |
| `staff`, `scanner` | `staff` |
| (none) | `participant` |
| `platform_role = super_admin` | `super_admin` |

---

## Sanctum token model

Uses Laravel default `personal_access_tokens` table (migration `000003`).

---

## Related models (not in Auth module)

| Model | Module | Auth relevance |
|-------|--------|----------------|
| `OrganizerMember` | Organizer | Membership validation, roles |
| `Organizer` | Organizer | Active organizer switching |
| `EventStaff` | Event | Event-level scanner assignment |
