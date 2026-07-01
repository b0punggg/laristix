# Organizer Module

Multi-tenant organizer workspaces with membership roles and platform approval.

## API Routes (`/api/v1`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/organizers` | sanctum | Create organizer (caller becomes owner) |
| GET | `/organizers/current` | sanctum + organizer context | Show active organizer |
| PATCH | `/organizers/current` | sanctum + organizer context | Update active organizer |
| GET | `/organizers/current/members` | sanctum + organizer context | List members |
| POST | `/organizers/current/members` | sanctum + organizer context | Invite member by email |
| PATCH | `/organizers/current/members/{id}` | sanctum + organizer context | Update role / accept invite |
| DELETE | `/organizers/current/members/{id}` | sanctum + organizer context | Remove member |
| GET | `/admin/organizers/pending` | sanctum (super_admin) | List pending organizers |
| POST | `/admin/organizers/{uuid}/approve` | sanctum (super_admin) | Approve organizer |

## Layer map

```
Models/          Organizer, OrganizerMember, OrganizerFeeConfig
Repositories/    OrganizerRepository, OrganizerMemberRepository
Services/        CreateOrganizerService, OrganizerService, OrganizerMemberService
Http/            OrganizerController, OrganizerMemberController
routes/v1.php
```

## Config

`config/organizer_module.php` — `ORGANIZER_AUTO_APPROVE`, rate limits, defaults.

## Membership roles

| DB role | Can manage members | Spatie sync |
|---------|-------------------|-------------|
| owner | yes | organizer |
| admin | yes | organizer |
| staff | no | staff |
| scanner | no | staff |
