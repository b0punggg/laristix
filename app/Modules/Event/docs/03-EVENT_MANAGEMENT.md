# Event Management Module

Lifecycle: **Create (draft) → Edit → Publish → Draft (unpublish) → Delete**

All management routes require `auth:sanctum` + organizer context.

---

## 1. Migration

`database/migrations/000010_create_events_table.php`

| Column | Purpose |
|--------|---------|
| `status` | `draft`, `published`, `live`, `completed`, `cancelled` |
| `published_at` | Set on publish, cleared on revert to draft |
| `organizer_id` | Tenant scope |
| `slug` | Unique per organizer |

---

## 2. Model

`app/Modules/Event/Models/Event.php`

Traits: `HasOrganizer`, `HasUuid`, `SoftDeletes`

Helpers: `isDraft()`, `canEdit()`, `canPublish()`, `canRevertToDraft()`, `canDelete()`

---

## 3. Repository

`app/Modules/Event/Repositories/Eloquent/EventRepository.php`

| Method | Purpose |
|--------|---------|
| `create()` | Insert event |
| `update()` | Patch fields |
| `delete()` | Soft delete |
| `markAsPublished()` | `status=published`, `published_at=now()` |
| `markAsDraft()` | `status=draft`, `published_at=null` |
| `paginateForOrganizer()` | List with filters |

---

## 4. Service

`app/Modules/Event/Services/EventService.php`

| Method | Feature |
|--------|---------|
| `create()` | Create Event (always starts as **draft**) |
| `update()` | Edit Event (draft or published only) |
| `publish()` | Publish Event (draft → published) |
| `draft()` | Revert to draft (published → draft) |
| `delete()` | Delete Event (draft or published) |

Authorization: organizer `owner` / `admin` for mutations; all members can view.

---

## 5. Controller

`app/Modules/Event/Http/Controllers/V1/EventManagementController.php`

---

## 6. Validation

| Request | Used for |
|---------|----------|
| `StoreEventRequest` | Create event |
| `UpdateEventRequest` | Edit event |
| `PublishEventRequest` | Publish action |
| `DraftEventRequest` | Revert to draft |
| `ListEventsRequest` | List filters (`status`, `search`) |

---

## 7. API Resource

`app/Modules/Event/Http/Resources/EventResource.php`

Includes `management` meta for authenticated users: `can_edit`, `can_publish`, `can_draft`, `can_delete`.

---

## API Routes

| Method | Route | Action |
|--------|-------|--------|
| POST | `/api/v1/events` | Create (draft) |
| PATCH | `/api/v1/events/{uuid}` | Edit |
| POST | `/api/v1/events/{uuid}/publish` | Publish |
| POST | `/api/v1/events/{uuid}/draft` | Revert to draft |
| DELETE | `/api/v1/events/{uuid}` | Delete |
| GET | `/api/v1/events` | List |
| GET | `/api/v1/events/{uuid}` | Show |

## Status flow

```
draft ──publish──► published ──draft──► draft
  │                    │
  └── delete ──────────┴── delete
```
