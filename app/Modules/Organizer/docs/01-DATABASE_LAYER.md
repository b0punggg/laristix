# Organizer Module — Database Layer

Migrations live in `database/migrations/` (shared numbering).

| File | Table |
|------|-------|
| `000004_create_organizers_table.php` | `organizers` |
| `000005_create_organizer_members_table.php` | `organizer_members` |
| `000006_create_organizer_fee_configs_table.php` | `organizer_fee_configs` |

## `organizers`

Platform tenant root. Status flow: `pending` → `active` (super admin approval) unless `ORGANIZER_AUTO_APPROVE=true`.

## `organizer_members`

Links `users` to `organizers` with role: `owner`, `admin`, `staff`, `scanner`.

Maps to Spatie application roles via `RoleService`:
- `owner` / `admin` → `organizer`
- `staff` / `scanner` → `staff`

## `organizer_fee_configs`

Platform fee rules per organizer (Admin module usage — model only for now).

## ER diagram

```
organizers ──1:N── organizer_members ──N:1── users
organizers ──1:N── organizer_fee_configs
organizers ──N:1── users (approved_by)
```
