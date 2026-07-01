# Ticketing Module

Ticket types per event: **Free**, **Paid**, **VIP** with quota and sales period.

---

## 1. Database

| Table | Migration |
|-------|-----------|
| `ticket_types` | `000017_create_ticket_types_table.php` |
| `kind` column | `000046_add_kind_to_ticket_types_table.php` |

| Column | Purpose |
|--------|---------|
| `kind` | `free`, `paid`, `vip` |
| `quantity` | Quota |
| `sold_count` / `reserved_count` | Allocation tracking |
| `sales_start_at` / `sales_end_at` | Sales period |
| `price` | `0` for free; `> 0` for paid/vip |

---

## 2. Model

`app/Modules/Ticketing/Models/TicketType.php`

Helpers: `availableQuantity()`, `isSalesOpen()`, `isPurchasable()`, `isFree()`

---

## 3. APIs

### Management (auth + organizer context)

| Method | Route | Action |
|--------|-------|--------|
| GET | `/api/v1/events/{eventUuid}/ticket-types` | List |
| POST | `/api/v1/events/{eventUuid}/ticket-types` | Create |
| GET | `/api/v1/events/{eventUuid}/ticket-types/{id}` | Show |
| PATCH | `/api/v1/events/{eventUuid}/ticket-types/{id}` | Update |
| DELETE | `/api/v1/events/{eventUuid}/ticket-types/{id}` | Delete |

### Public

| Method | Route | Action |
|--------|-------|--------|
| GET | `/api/v1/public/events/{uuid}/ticket-types` | Purchasable tickets |

---

## 4. Business logic

`TicketTypeService`:

| Rule | Behavior |
|------|----------|
| Free ticket | `kind=free` → price forced to `0` |
| Paid / VIP | price must be `> 0` |
| Quota | `quantity` ≥ 1; cannot reduce below sold+reserved |
| Sales period | `sales_end_at` must be after `sales_start_at` |
| Sold out | Auto `status=sold_out` when quota exhausted |
| Delete | Only when `sold_count` and `reserved_count` are 0 |
| Authorization | Organizer `owner` / `admin` for mutations |

---

## Example: Create VIP ticket

```json
POST /api/v1/events/{eventUuid}/ticket-types
{
  "kind": "vip",
  "name": "VIP Access",
  "price": 500000,
  "currency": "IDR",
  "quantity": 50,
  "sales_start_at": "2026-06-01T00:00:00+07:00",
  "sales_end_at": "2026-07-01T23:59:59+07:00",
  "min_per_order": 1,
  "max_per_order": 4
}
```
