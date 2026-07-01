# Event Module — Database Layer

| File | Table |
|------|-------|
| `000008_create_event_categories_table.php` | `event_categories` |
| `000009_create_venues_table.php` | `venues` |
| `000010_create_events_table.php` | `events` |
| `000011_create_event_schedules_table.php` | `event_schedules` |
| `000012_create_event_media_table.php` | `event_media` |
| `000013_create_event_sessions_table.php` | `event_sessions` |
| `000041_create_event_staffs_table.php` | `event_staffs` |

## Core entity: `events`

Tenant-scoped via `organizer_id` + `HasOrganizer` global scope.

Status: `draft` → `published` → `live` → `completed` / `cancelled`

## Relationships (Event model)

| Method | Target |
|--------|--------|
| `organizer()` | `Organizer` |
| `venue()` | `Venue` |
| `category()` | `EventCategory` |
| `createdBy()` | `User` |
| `schedules()` | `EventSchedule` |
| `media()` | `EventMedia` |
| `sessions()` | `EventSession` |
| `staffs()` | `EventStaff` |

Schedules, media, sessions, and staff models are in place for future sub-features.
