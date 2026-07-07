# Laristix Design System

Premium UI foundation for Laristix. **Do not put business logic here** — only tokens, primitives, and reusable presentation components.

> **Full UI guideline:** see [`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) — the canonical reference for colors, typography, spacing, components, accessibility, and naming conventions. Every future page must follow it.

## Identity

- **Brand color**: Deep event-tech blue (`--brand`) — confident, trustworthy, modern
- **Typography**: Plus Jakarta Sans (via `--font-sans`) with responsive scale utilities (`ds-heading-*`, `ds-body-*`)
- **Icons**: Lucide only, sizes 16 / 18 / 20 / 24 / 32 via `<Icon />`
- **Motion**: Fast (120ms), normal (200ms), slow (320ms) with expo ease-out

## Usage

```tsx
import { Container, Text, EventCard, DsEmptyState } from "@/design-system";
import { Button } from "@/components/ui/button";
```

## Token layers

| Layer | Location |
|-------|----------|
| CSS variables | `src/app/globals.css` |
| Tailwind theme | `tailwind.config.ts` |
| TS constants | `src/design-system/tokens/` |

## Components

- **UI primitives** (`src/components/ui/`): Button, Input, Dialog, Table, etc.
- **DS compositions** (`src/design-system/components/`): EventCard, ErrorState, Sidebar, etc.
- **Layouts** (`src/design-system/layouts/`): PublicLayout, DashboardLayout, AuthLayout, etc.

## Dark mode

Add `class="dark"` on `<html>`. All semantic tokens have `.dark` overrides in `globals.css`.

## Migration

Existing pages keep working via legacy aliases (`storefront-*`). Migrate page-by-page to DS imports — do not bulk-replace until a page is explicitly redesigned.
