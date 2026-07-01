# Event Module

Event CRUD, publishing, venues, and public discovery.

## Public routes (no auth)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/public/events` | List published public events |
| GET | `/public/events/{uuid}` | Event detail |
| GET | `/public/event-categories` | Global + platform categories |

## Organizer routes (sanctum + organizer context)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/events` | List organizer events |
| POST | `/events` | Create draft event |
| GET | `/events/{uuid}` | Show event |
| PATCH | `/events/{uuid}` | Update event |
| DELETE | `/events/{uuid}` | Delete draft |
| POST | `/events/{uuid}/publish` | Publish draft |
| GET/POST/DELETE | `/venues` | Venue management |
| GET | `/event-categories` | Categories for organizer |

## Authorization

- **Manage** (create, update, publish, delete, venues): organizer `owner` or `admin`
- **View** (list, show): any active organizer member

## Config

`config/event_module.php` — pagination, rate limits
