# Laristix Design System

**Version:** 1.0  
**Status:** Canonical UI guideline  
**Scope:** `laristix-web` frontend  
**Last updated:** June 2026

This document is the single source of truth for all UI decisions in Laristix. Every new page, component, and design change **must** follow this guideline. Do not introduce one-off colors, spacing, typography, or component patterns outside this system.

---

## Table of contents

1. [Design philosophy](#1-design-philosophy)
2. [Architecture](#2-architecture)
3. [Color palette](#3-color-palette)
4. [Typography scale](#4-typography-scale)
5. [Spacing scale](#5-spacing-scale)
6. [Border radius](#6-border-radius)
7. [Shadows](#7-shadows)
8. [Grid system](#8-grid-system)
9. [Responsive breakpoints](#9-responsive-breakpoints)
10. [Components](#10-components)
11. [Buttons](#11-buttons)
12. [Inputs](#12-inputs)
13. [Cards](#13-cards)
14. [Tables](#14-tables)
15. [Forms](#15-forms)
16. [Navigation](#16-navigation)
17. [Icons](#17-icons)
18. [Motion](#18-motion)
19. [Accessibility rules](#19-accessibility-rules)
20. [Naming conventions](#20-naming-conventions)
21. [Migration & enforcement](#21-migration--enforcement)

---

## 1. Design philosophy

### Identity: Laristix Pulse

Laristix is an event management and ticketing platform. The visual identity is **confident, modern, and trustworthy** — built for organizers, attendees, and staff who need clarity under pressure (live events, payments, check-ins).

| Principle | Decision |
|-----------|----------|
| **Clarity over decoration** | Information hierarchy first. Every screen answers: *what is this, what can I do, what happens next?* |
| **Semantic tokens only** | Never hardcode hex/rgb in components. Use CSS variables → Tailwind semantic classes. |
| **Composable, not duplicated** | If a pattern appears twice, extract it into `components/ui` or `design-system`. |
| **Responsive by default** | Mobile-first. Every component must work on 320px+ viewports. |
| **Accessible by default** | Keyboard navigable, visible focus, sufficient contrast, proper ARIA. |
| **Dark-mode ready** | All tokens have `.dark` overrides. Enable with `class="dark"` on `<html>`. |

### Font

**Plus Jakarta Sans** — geometric, friendly, highly legible at small sizes. Loaded via `next/font/google` as `--font-sans`.

```tsx
// src/app/layout.tsx
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
```

Do not introduce additional font families without a design review.

---

## 2. Architecture

The design system is split into three layers:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 3 — Composed DS components                       │
│  src/design-system/components/  (EventCard, Sidebar…)   │
│  src/design-system/layouts/     (DashboardLayout…)      │
├─────────────────────────────────────────────────────────┤
│  Layer 2 — UI primitives (Radix + CVA)                  │
│  src/components/ui/             (Button, Dialog, Table…) │
├─────────────────────────────────────────────────────────┤
│  Layer 1 — Tokens                                       │
│  src/app/globals.css            (CSS variables)         │
│  tailwind.config.ts             (Tailwind theme)        │
│  src/design-system/tokens/      (TS constants)          │
└─────────────────────────────────────────────────────────┘
```

### Import rules

```tsx
// Tokens, primitives, composed components, layouts
import { Container, Text, EventCard, DsEmptyState } from "@/design-system";

// Low-level UI primitives
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

| Need | Import from |
|------|-------------|
| Page layout shell | `@/design-system` → `PublicLayout`, `DashboardLayout`, etc. |
| Domain card (event, ticket…) | `@/design-system` → `EventCard`, `TicketCard`, etc. |
| Generic UI control | `@/components/ui/*` |
| Typography / grid | `@/design-system` → `Text`, `Container`, `Grid`, `Stack` |
| Raw token values (charts, canvas) | `@/design-system/tokens/colors` |

**Never** copy Tailwind class strings from one feature file to another. Extend the system instead.

---

## 3. Color palette

All colors are defined as **HSL CSS variables** (without `hsl()` wrapper) in `src/app/globals.css`. Tailwind consumes them as `hsl(var(--token))`.

### 3.1 Brand

The Laristix brand is a deep event-tech blue. It conveys trust, professionalism, and energy.

| Token | Light mode (HSL) | Tailwind class | Usage |
|-------|------------------|----------------|-------|
| `--brand` | `224 77% 48%` | `bg-brand`, `text-brand` | Primary brand moments, links, active nav |
| `--brand-hover` | `224 76% 42%` | `bg-brand-hover` | Hover on brand surfaces |
| `--brand-active` | `224 70% 35%` | `bg-brand-active` | Pressed / active brand surfaces |
| `--brand-foreground` | `0 0% 100%` | `text-brand-foreground` | Text on brand backgrounds |
| `--brand-muted` | `224 80% 96%` | `bg-brand-muted` | Subtle brand tint (badges, active nav bg) |
| `--brand-deep` | `224 70% 35%` | `bg-brand-deep` | Gradients, hero accents |
| `--brand-light` | `224 85% 58%` | `bg-brand-light` | Gradient highlights |

**Decision:** `--primary` aliases `--brand`. The default `<Button variant="primary">` uses brand blue, not neutral gray.

### 3.2 Semantic action colors

| Role | Token | Light (HSL) | Muted bg token | When to use |
|------|-------|-------------|----------------|-------------|
| **Primary** | `--primary` | = `--brand` | — | Main CTAs, primary buttons |
| **Secondary** | `--secondary` | `220 14% 96%` | — | Secondary actions, subtle buttons |
| **Success** | `--success` | `152 69% 38%` | `--success-muted` | Paid, confirmed, valid ticket |
| **Warning** | `--warning` | `38 92% 50%` | `--warning-muted` | Pending, low stock, caution |
| **Danger** | `--danger` | `0 84% 60%` | `--danger-muted` | Errors, delete, cancelled |
| **Info** | `--info` | `214 95% 52%` | `--info-muted` | Informational alerts, tips |

Each semantic color has `-hover`, `-foreground`, and (where applicable) `-muted` variants.

### 3.3 Surface & structure

| Token | Light (HSL) | Tailwind | Usage |
|-------|-------------|----------|-------|
| `--background` | `0 0% 100%` | `bg-background` | Page background |
| `--foreground` | `224 47% 11%` | `text-foreground` | Default body text |
| `--surface` | `220 20% 98%` | `bg-surface` | Subtle section backgrounds |
| `--surface-raised` | `0 0% 100%` | `bg-surface-raised` | Elevated panels on surface |
| `--card` | `0 0% 100%` | `bg-card` | Card backgrounds |
| `--card-foreground` | `224 47% 11%` | `text-card-foreground` | Card text |
| `--muted` | `220 14% 96%` | `bg-muted` | Disabled areas, skeleton base |
| `--muted-foreground` | `220 9% 46%` | `text-muted-foreground` | Secondary text, captions |
| `--border` | `220 13% 91%` | `border-border` | Default borders |
| `--border-strong` | `220 9% 80%` | `border-border-strong` | Emphasized dividers |
| `--input` | `220 13% 91%` | `border-input` | Input borders |
| `--ring` | `224 77% 48%` | `ring-ring` | Focus rings |
| `--accent` | `224 80% 96%` | `bg-accent` | Hover highlights |
| `--popover` | `0 0% 100%` | `bg-popover` | Dropdown / popover bg |

### 3.4 Text colors

| Token | Light (HSL) | Tailwind | Usage |
|-------|-------------|----------|-------|
| `--text-primary` | `224 47% 11%` | `text-text-primary` | Headings, primary content |
| `--text-secondary` | `220 9% 46%` | `text-text-secondary` | Supporting text |
| `--text-disabled` | `220 9% 65%` | — | Disabled labels |
| `--disabled` | `220 14% 96%` | `bg-disabled` | Disabled control backgrounds |

Use `text-foreground` for default body text. Use `text-muted-foreground` for captions and hints. Use semantic colors (`text-success`, `text-danger`) only for status meaning.

### 3.5 Dark mode

Add `class="dark"` to `<html>`. All tokens above have `.dark` overrides in `globals.css`. Dark surfaces use deep blue-grays (`224 47% 6%` background) to maintain brand cohesion.

**Rule:** Never write separate dark-mode color values in components. Always use semantic tokens.

### 3.6 Color usage rules

| ✅ Do | ❌ Don't |
|-------|---------|
| `bg-brand`, `text-muted-foreground` | `#1e4fd6`, `text-gray-500` |
| `bg-success-muted text-success` for status badges | `bg-green-100 text-green-700` |
| `border-border` for dividers | `border-gray-200` |
| Semantic tokens for alerts | Raw Tailwind color palette |

---

## 4. Typography scale

**Font family:** `font-sans` → Plus Jakarta Sans  
**Rendering:** `antialiased` on `<body>`

### 4.1 Scale

| Name | CSS class | Component variant | Mobile → Desktop | Weight | Usage |
|------|-----------|-------------------|------------------|--------|-------|
| Display XL | `.ds-display-xl` | `variant="display-xl"` | 36px → 48px → 60px | 700 | Hero headlines |
| Display L | `.ds-display-lg` | `variant="display-lg"` | 30px → 36px | 700 | Page titles (marketing) |
| Heading 1 | `.ds-heading-1` | `variant="h1"` | 24px → 30px | 700 | Dashboard page titles |
| Heading 2 | `.ds-heading-2` | `variant="h2"` | 20px → 24px | 600 | Section headings |
| Heading 3 | `.ds-heading-3` | `variant="h3"` | 18px → 20px | 600 | Card titles, subsections |
| Heading 4 | `.ds-heading-4` | `variant="h4"` | 16px | 600 | Compact headings, dialog titles |
| Body Large | `.ds-body-lg` | `variant="body-lg"` | 16px | 400 | Lead paragraphs |
| Body Medium | `.ds-body-md` | `variant="body-md"` | 14px | 400 | Default UI body text |
| Body Small | `.ds-body-sm` | `variant="body-sm"` | 12px | 400 | Dense UI, metadata |
| Caption | `.ds-caption` | `variant="caption"` | 12px | 400 | Hints, timestamps (muted) |
| Overline | `.ds-overline` | `variant="overline"` | 11px | 600 | Category labels (uppercase) |
| Button Text | `.ds-button-text` | — | 14px | 500 | Applied automatically on buttons |

All display and heading styles use `tracking-tight`. Overline uses `uppercase tracking-widest`.

### 4.2 Text component

```tsx
import { Text } from "@/design-system";

<Text variant="h2">Event Saya</Text>
<Text variant="caption" color="muted">Diperbarui 2 jam lalu</Text>
<Text variant="body-md" color="brand">Lihat detail</Text>
```

**Color variants:** `default` | `primary` | `secondary` | `muted` | `brand` | `success` | `warning` | `danger`

### 4.3 Typography rules

| ✅ Do | ❌ Don't |
|-------|---------|
| `<Text variant="h2">` or `.ds-heading-2` | `text-2xl font-bold` ad hoc |
| One H1 per page | Multiple `variant="h1"` on same page |
| `text-balance` on hero headlines | Fixed pixel font sizes |
| `variant="caption"` for secondary info | `text-gray-400` |

---

## 5. Spacing scale

Based on a **4px grid**. Use Tailwind spacing utilities that map to this scale.

| Token key | Value | Tailwind | Common usage |
|-----------|-------|----------|--------------|
| `1` | 4px | `p-1`, `gap-1`, `m-1` | Icon gaps, tight padding |
| `2` | 8px | `p-2`, `gap-2` | Inline element spacing |
| `3` | 12px | `p-3`, `gap-3` | Compact card padding |
| `4` | 16px | `p-4`, `gap-4` | Default component padding |
| `5` | 20px | `p-5`, `gap-5` | Form field groups |
| `6` | 24px | `p-6`, `gap-6` | Card header/content padding |
| `8` | 32px | `p-8`, `gap-8` | Section spacing |
| `10` | 40px | `p-10` | Large section gaps |
| `12` | 48px | `p-12`, `py-12` | Section vertical rhythm |
| `16` | 64px | `p-16`, `py-16` | Hero / marketing sections |
| `20` | 80px | `p-20` | Large marketing whitespace |
| `24` | 96px | `p-24` | Maximum section padding |

Reference: `src/design-system/tokens/spacing.ts`

### Spacing decisions

| Context | Padding / margin |
|---------|------------------|
| Card header & content | `p-6` |
| Card compact | `p-4` |
| Dashboard page content | `p-4 md:p-6 lg:p-8` |
| Public section vertical | `py-12 md:py-16` (`.storefront-section` alias) |
| Form field gap | `space-y-2` (label → input → hint) |
| Button group gap | `gap-2` |
| Grid column gap | `gap-4 md:gap-6` |

**Rule:** Only use values from this scale. Do not use arbitrary values like `p-[13px]`.

---

## 6. Border radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--radius-xs` | 4px | `rounded-xs` | Checkboxes, micro elements |
| `--radius-sm` | 6px | `rounded-sm` | Small buttons, tags |
| `--radius-md` | 8px | `rounded-md` | **Default** — inputs, buttons, cards |
| `--radius-lg` | 12px | `rounded-lg` | Large buttons, modals |
| `--radius-xl` | 16px | `rounded-xl` | Dialogs, drawers |
| `--radius-2xl` | 20px | `rounded-2xl` | Feature cards, bottom sheets |
| `--radius-full` | 9999px | `rounded-full` | Avatars, badges, pills |

**Decision:** `--radius` defaults to `--radius-md` (8px). Cards use `rounded-lg`. Badges use `rounded-full`.

---

## 7. Shadows

Elevation uses a 5-level shadow scale. All shadows use slate-tinted rgba in light mode and pure black rgba in dark mode.

| Token | Tailwind | Usage |
|-------|----------|-------|
| `--shadow-xs` | `shadow-xs` | Buttons, subtle lift |
| `--shadow-sm` | `shadow-sm` | Cards at rest |
| `--shadow-md` | `shadow-md` | Card hover, dropdowns |
| `--shadow-lg` | `shadow-lg` | Modals, drawers |
| `--shadow-xl` | `shadow-xl` | Full-screen overlays |

### Elevation rules

| Element | Shadow |
|---------|--------|
| Button (primary) | `shadow-xs` |
| Card (default) | `shadow-sm` |
| Card (interactive hover) | `shadow-sm` → `shadow-md` on hover |
| Dialog / Drawer | `shadow-lg` / `shadow-xl` |
| Popover / Dropdown | `shadow-md` |

**Rule:** Do not use `shadow-2xl` or custom box-shadow values.

---

## 8. Grid system

### Container

| Property | Value |
|----------|-------|
| Max width | `1440px` (`max-w-container`) |
| Horizontal padding | `16px` mobile → `24px` tablet → `32px` desktop |
| CSS class | `.ds-container` |
| Component | `<Container size="default \| narrow \| wide" />` |

| Container size | Max width | Usage |
|----------------|-----------|-------|
| `default` | 1440px | Most pages |
| `narrow` | `max-w-2xl` (672px) | Auth forms, article content |
| `wide` | `max-w-screen-2xl` | Data-heavy admin views |

### Column grid

| Breakpoint | Columns | Gap | CSS / Component |
|------------|---------|-----|-----------------|
| Mobile (< 768px) | 4 | 16px | `.ds-grid`, `<Grid />` |
| Tablet (≥ 768px) | 8 | 24px | `md:grid-cols-8 md:gap-6` |
| Desktop (≥ 1024px) | 12 | 24px | `lg:grid-cols-12` |

```tsx
import { Container, Grid } from "@/design-system";

<Container>
  <Grid className="lg:col-span-12">
    <div className="col-span-4 md:col-span-6 lg:col-span-4">…</div>
  </Grid>
</Container>
```

### Layout shells

| Shell | Path | Usage |
|-------|------|-------|
| `PublicLayout` | `design-system/layouts` | Marketing, discovery, public pages |
| `DashboardLayout` | `design-system/layouts` | Organizer / admin dashboards |
| `AuthLayout` | `design-system/layouts` | Login, register, password reset |
| `OrganizerLayout` | alias of `DashboardLayout` | Organizer-specific views |
| `AdminLayout` | alias of `DashboardLayout` | Platform admin |
| `ScannerLayout` | `design-system/layouts` | Check-in scanner (minimal chrome) |
| `MobileLayout` | `design-system/layouts` | Mobile-first with bottom nav slot |

---

## 9. Responsive breakpoints

| Name | Min width | Tailwind prefix | Target devices |
|------|-----------|-----------------|----------------|
| Mobile | 0px | (default) | Phones (320px+) |
| Large mobile | 640px | `sm:` | Large phones, small tablets |
| Tablet | 768px | `md:` | Tablets, small laptops |
| Laptop | 1024px | `lg:` | Laptops, small desktops |
| Desktop | 1280px | `xl:` | Desktop monitors |
| Wide | 1440px | `2xl:` / `max-w-container` | Full container width |

Reference: `src/design-system/tokens/breakpoints.ts`

### Responsive rules

1. **Mobile-first:** Write base styles for mobile, add `md:` / `lg:` for larger screens.
2. **Touch targets:** Minimum 44×44px for interactive elements on mobile.
3. **Tables:** Wrap in scroll container or switch to card layout below `md`.
4. **Navigation:** Sidebar on `lg+`, drawer/bottom nav below `lg`.
5. **Typography:** Display and heading classes scale up automatically via responsive utilities.

---

## 10. Components

### 10.1 UI primitives (`src/components/ui/`)

Low-level, Radix-powered building blocks. Use these for any generic UI need.

| Component | File | Purpose |
|-----------|------|---------|
| `Button` | `button.tsx` | All clickable actions |
| `IconButton` | `icon-button.tsx` | Icon-only actions (requires `label`) |
| `Input` | `input.tsx` | Text, email, number inputs |
| `InputAffix` | `input-affix.tsx` | Input with prefix/suffix slots |
| `PasswordInput` | `password-input.tsx` | Password with show/hide toggle |
| `SearchInput` | `search-input.tsx` | Search field with icon |
| `Textarea` | `textarea.tsx` | Multi-line text |
| `Select` | `select.tsx` | Native select styling |
| `Label` | `label.tsx` | Form labels |
| `FormField` | `form-field.tsx` | Label + input + hint + error wrapper |
| `Checkbox` | `checkbox.tsx` | Boolean selection |
| `RadioGroup` | `radio-group.tsx` | Single selection from list |
| `Switch` | `switch.tsx` | Toggle on/off |
| `Badge` | `badge.tsx` | Status labels, tags |
| `Avatar` | `avatar.tsx` | User/org images |
| `Alert` | `alert.tsx` | Inline messages |
| `Separator` | `separator.tsx` | Visual dividers |
| `Spinner` | `spinner.tsx` | Loading indicator |
| `Progress` | `progress.tsx` | Progress bar |
| `Skeleton` | `skeleton.tsx` | Loading placeholder |
| `Card` | `card.tsx` | Generic card container |
| `Dialog` | `dialog.tsx` | Modal dialogs |
| `Drawer` | `drawer.tsx` | Slide-in panels (left/right/bottom) |
| `Tabs` | `tabs.tsx` | Tabbed content |
| `Accordion` | `accordion.tsx` | Collapsible sections |
| `Tooltip` | `tooltip.tsx` | Hover hints |
| `Popover` | `popover.tsx` | Floating content |
| `DropdownMenu` | `dropdown-menu.tsx` | Action menus |
| `Table` | `table.tsx` | Data tables |
| `TableToolbar` | `table.tsx` | Table header with actions |
| `Pagination` | `pagination.tsx` | Page navigation |
| `Breadcrumb` | `breadcrumb.tsx` | Hierarchy navigation |
| `FilterBar` | `filter-bar.tsx` | Filter control row |
| `SearchBar` | `filter-bar.tsx` | Search wrapper |
| `Toaster` | `sonner.tsx` | Toast notifications (Sonner) |

### 10.2 Composed DS components (`src/design-system/`)

Higher-level, domain-aware presentation components. No business logic or API calls.

| Category | Components |
|----------|------------|
| **Cards** | `StatCard`, `EventCard`, `OrganizerCard`, `TicketCard`, `PaymentCard`, `ProfileCard` |
| **States** | `DsEmptyState`, `ErrorState`, `NotFoundState`, `PermissionDeniedState` |
| **Navigation** | `Sidebar`, `TopNav`, `DsFooter`, `UserMenu`, `NotificationMenu` |
| **Charts** | `ChartsContainer` |
| **Primitives** | `Text`, `Container`, `Grid`, `Stack`, `Icon` |
| **Layouts** | `PublicLayout`, `DashboardLayout`, `AuthLayout`, `ScannerLayout`, `MobileLayout` |

### 10.3 Component rules

1. **No duplication** — if a UI pattern exists in the DS, use it.
2. **No inline styles** — except dynamic values (e.g. chart width, progress %).
3. **No raw HTML form controls** — always use DS form components.
4. **Client components** — Radix primitives that use hooks are `"use client"`. Composed server-safe components should stay server-compatible where possible.
5. **Legacy components** — `components/common/empty-state.tsx` and similar pre-DS files remain for backward compatibility. Migrate to DS equivalents on next touch.

---

## 11. Buttons

### Variants

| Variant | Usage | Visual |
|---------|-------|--------|
| `primary` | Main CTA per section | Brand blue fill, white text |
| `secondary` | Secondary actions | Light gray fill |
| `outline` | Tertiary / cancel-adjacent | Border only |
| `ghost` | Inline / toolbar actions | No background until hover |
| `danger` | Destructive actions (delete, cancel order) | Red fill |
| `success` | Positive confirmation | Green fill |
| `link` | Inline text actions | Brand underline |

Deprecated aliases (still work, do not use in new code): `default` → `primary`, `destructive` → `danger`.

### Sizes

| Size | Height | Usage |
|------|--------|-------|
| `sm` | 32px | Table actions, compact UI |
| `md` | 40px | **Default** |
| `lg` | 44px | Hero CTAs, mobile primary actions |
| `icon` | 40×40px | Icon-only (use `IconButton` instead) |
| `icon-sm` | 32×32px | Compact icon-only |
| `icon-lg` | 44×44px | Large touch targets |

### States

| State | Behavior |
|-------|----------|
| **Loading** | `<Button loading>` — shows spinner, sets `aria-busy`, disables click |
| **Disabled** | `disabled` — 50% opacity, no pointer events |
| **Focus** | `.ds-focus-ring` — 2px brand ring with offset |

### IconButton

Always requires a `label` prop for screen readers (renders as `aria-label`).

```tsx
<IconButton variant="ghost" size="sm" label="Tutup">
  <X className="size-4" />
</IconButton>
```

### Button rules

| ✅ Do | ❌ Don't |
|-------|---------|
| One `primary` CTA per visible section | Multiple competing primary buttons |
| `danger` for irreversible actions | `primary` for delete |
| `loading` prop during async submit | Change button text to "Loading..." |
| `IconButton` with `label` | Icon-only `<button>` without aria-label |

---

## 12. Inputs

### Base input

- Height: `40px` (`h-10`)
- Border: `border-input`
- Radius: `rounded-md`
- Focus: `.ds-focus-ring`
- Font: `text-base` mobile → `text-sm` desktop
- Placeholder: `text-muted-foreground`

### Input variants

| Component | Purpose |
|-----------|---------|
| `Input` | Standard text fields |
| `Textarea` | Multi-line |
| `Select` | Dropdown selection |
| `SearchInput` | Search with magnifier icon, `type="search"` |
| `PasswordInput` | Password with visibility toggle |
| `InputAffix` | `prefixSlot` / `suffixSlot` for icons, units, currency |
| `Checkbox` | Boolean |
| `RadioGroup` | Exclusive choice |
| `Switch` | On/off toggle |

### Input states

| State | Styling |
|-------|---------|
| Default | `border-input bg-background` |
| Focus | `ring-2 ring-ring ring-offset-2` |
| Disabled | `opacity-50 cursor-not-allowed` |
| Error | Set via `FormField` — `aria-invalid`, red error text below |
| Success | Set via `FormField` — green success text below |

### Input rules

| ✅ Do | ❌ Don't |
|-------|---------|
| Pair every input with `<Label>` or `<FormField>` | Placeholder as sole label |
| `FormField` for validation messages | Inline red text without `role="alert"` |
| `SearchInput` for search UX | Plain `Input` with manual icon positioning |
| `PasswordInput` for passwords | Raw `type="password"` without toggle |

---

## 13. Cards

### Base card (`Card`)

| Variant | Usage |
|---------|-------|
| `default` | Standard card, `shadow-sm` |
| `elevated` | Higher emphasis, `shadow-md` |
| `interactive` | Clickable cards — hover lift + shadow |
| `flat` | No shadow, border only |

Sub-components: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

**Standard padding:** `p-6` (header/content/footer). Use `padding="none"` for image cards.

### Domain cards

| Component | Purpose | Key features |
|-----------|---------|--------------|
| `StatCard` | Dashboard metrics | Label, value, optional icon/trend |
| `EventCard` | Event discovery | Image, date, location, price, badge |
| `OrganizerCard` | Organizer profiles | Avatar, verified badge, event count |
| `TicketCard` | Attendee tickets | QR slot, status badge, holder name |
| `PaymentCard` | Payment summary | Amount, method, reference, status |
| `ProfileCard` | User profiles | Avatar, role badge, actions |

### Card rules

| ✅ Do | ❌ Don't |
|-------|---------|
| `variant="interactive"` for clickable cards | `onClick` on `Card` without interactive variant |
| Consistent `p-6` internal padding | Mixed `p-4` / `p-8` in same context |
| `CardFooter` for actions | Buttons floating outside card boundary |
| Domain cards from `@/design-system` | Rebuild event card markup per page |

---

## 14. Tables

### Structure

```tsx
<TableToolbar title="Event" description="Kelola semua event">
  <Button size="sm">Tambah</Button>
</TableToolbar>

<Table>
  <TableHeader>
  <TableRow>
    <TableHead>Nama</TableHead>
  </TableRow>
  </TableHeader>
  <TableBody>
  <TableRow>
    <TableCell>…</TableCell>
  </TableRow>
  </TableBody>
</Table>
```

### Table specs

| Property | Value |
|----------|-------|
| Header height | 44px (`h-11`) |
| Header style | Uppercase, `text-xs`, `font-semibold`, `text-muted-foreground` |
| Cell padding | `px-4 py-3` |
| Row hover | `hover:bg-muted/50` |
| Row selection | `data-[state=selected]:bg-muted` |
| Border | Wrapped in `rounded-lg border` scroll container |
| Header background | `bg-muted/50` |

### Pagination

Use `<Pagination>` from `components/ui/pagination.tsx` for generic page controls.

For API-driven lists with Laravel meta, `components/common/list-pagination.tsx` remains until migrated.

### Table rules

| ✅ Do | ❌ Don't |
|-------|---------|
| `TableToolbar` for title + bulk actions | Actions floating above unstyled table |
| Sticky header on long tables (`sticky top-0`) | Unscrollable tables on mobile |
| `Pagination` with `aria-current="page"` | Custom prev/next without labels |
| Empty state via `DsEmptyState` when no rows | Blank table body |

---

## 15. Forms

### Form composition

```tsx
<FormField
  id="email"
  label="Email"
  required
  helpText="Kami tidak akan membagikan email Anda."
  error={errors.email?.message}
>
  <Input type="email" placeholder="nama@email.com" />
</FormField>
```

### FormField anatomy

1. **Label** — `Label` component, with `*` for required fields + `sr-only` "(wajib diisi)"
2. **Control** — child input (receives `id`, `aria-describedby`, `aria-invalid`)
3. **Help text** — `.ds-caption` below input
4. **Error** — `text-danger text-xs font-medium`, `role="alert"`
5. **Success** — `text-success` (only when no error)

### Form layout

| Pattern | Spacing |
|---------|---------|
| Single column form | `space-y-4` or `space-y-6` |
| Field internal | `space-y-2` (handled by `FormField`) |
| Inline fields | `grid grid-cols-1 md:grid-cols-2 gap-4` |
| Form actions | `flex gap-2 justify-end` in footer |

### Validation rules

- Show errors below the field, not in toasts (toasts for submit-level errors only).
- Set `aria-invalid="true"` on invalid fields.
- Link hints/errors via `aria-describedby`.
- Required fields: visual `*` + screen reader text.

---

## 16. Navigation

### Sidebar

- Width: `256px` expanded, `72px` collapsed
- Active item: `bg-brand-muted text-brand`
- Inactive: `text-muted-foreground hover:bg-muted`
- Focus: `.ds-focus-ring`
- Icon + label (label hidden when collapsed, use `title` tooltip)

### TopNav

- Height: `64px` (`h-16`)
- Sticky by default with `backdrop-blur`
- Slots: `brand`, `start`, `end`
- Uses `.ds-container` for horizontal alignment

### Mobile patterns

| Pattern | Component |
|---------|-----------|
| Bottom tab bar | `MobileLayout` + `bottomNav` slot |
| Side drawer | `Drawer side="left"` |
| Bottom sheet | `Drawer side="bottom"` |

### Breadcrumb

```tsx
<Breadcrumb items={[
  { label: "Dashboard", href: "/dashboard" },
  { label: "Event", href: "/dashboard/events" },
  { label: "Detail" },
]} />
```

### User & notification menus

- `UserMenu` — avatar trigger, dropdown with profile/settings/logout
- `NotificationMenu` — bell icon with count badge, popover list

### Navigation rules

| ✅ Do | ❌ Don't |
|-------|---------|
| `aria-current="page"` on active links | Multiple active states |
| `aria-label` on nav landmarks | Unlabeled `<nav>` |
| Consistent sidebar across dashboard views | Per-page custom sidebars |
| `Breadcrumb` on nested pages | Only browser back button |

---

## 17. Icons

**Library:** [Lucide React](https://lucide.dev) only. No Heroicons, Font Awesome, or custom SVGs unless added to the DS.

### Size scale

| Token | Pixels | Tailwind | `Icon` size prop | Usage |
|-------|--------|----------|------------------|-------|
| `xs` | 16px | `size-4` | `size="xs"` | Inline with small text, badges |
| `sm` | 18px | `size-[18px]` | `size="sm"` | Compact UI |
| `md` | 20px | `size-5` | `size="md"` | **Default** — buttons, inputs |
| `lg` | 24px | `size-6` | `size="lg"` | Section icons, empty states |
| `xl` | 32px | `size-8` | `size="xl"` | Feature icons, hero |

Reference: `src/design-system/tokens/icons.ts`

### Icon component

```tsx
import { Calendar } from "lucide-react";
import { Icon } from "@/design-system";

<Icon icon={Calendar} size="md" label="Tanggal event" />
```

- Decorative icons: omit `label` → renders `aria-hidden`
- Meaningful icons: pass `label` for screen readers

### Icon rules

| ✅ Do | ❌ Don't |
|-------|---------|
| Lucide icons only | Mix icon libraries |
| Size from the 5-token scale | Arbitrary `size-7`, `w-[22px]` |
| `aria-hidden` on decorative icons | Announce decorative icons |
| `strokeWidth={2}` (Lucide default) | Filled icon sets |

---

## 18. Motion

### Duration tokens

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--duration-fast` | 120ms | `duration-fast` | Micro-interactions (toggle, checkbox) |
| `--duration-normal` | 200ms | `duration-normal` | **Default** — buttons, cards, fades |
| `--duration-slow` | 320ms | `duration-slow` | Page enters, drawer open |

### Easing

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | `ease-out-expo` | Entrances, hovers |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-in-out-soft` | State transitions |

### Animation utilities

| Class | Effect |
|-------|--------|
| `.ds-animate-fade-in` | Opacity 0 → 1 |
| `.ds-animate-slide-up` | Fade + translateY(10px → 0) |
| `.ds-animate-scale-in` | Fade + scale(0.96 → 1) |
| `.ds-card-hover` | Hover lift + shadow (cards) |
| `animate-ds-spin` | Spinner rotation |
| `animate-ds-pulse-soft` | Skeleton pulse |

Radix overlays (Dialog, Drawer, Popover) use `tailwindcss-animate` enter/exit classes.

### Motion rules

| ✅ Do | ❌ Don't |
|-------|---------|
| `duration-normal` for UI feedback | Animations > 500ms |
| `ease-out-expo` for entrances | `linear` for UI transitions |
| Respect `prefers-reduced-motion` (future) | Parallax, excessive bounce |
| Subtle hover on interactive cards | Large scale transforms |

---

## 19. Accessibility rules

### Keyboard navigation

- All interactive elements must be reachable via `Tab`.
- Modals trap focus and restore on close (Radix Dialog handles this).
- Dropdowns/menus: arrow keys navigate items.
- Escape closes overlays (Dialog, Drawer, Popover, Dropdown).

### Focus visibility

All interactive components use `.ds-focus-ring`:

```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

Never remove focus outlines without providing an alternative.

### ARIA

| Pattern | Requirement |
|---------|-------------|
| Icon-only buttons | `aria-label` via `IconButton label` prop |
| Loading buttons | `aria-busy="true"` |
| Form errors | `aria-invalid` + `role="alert"` on error text |
| Form hints | `aria-describedby` linking hint/error IDs |
| Navigation | `aria-label` on `<nav>`, `aria-current="page"` on active link |
| Pagination | `<nav aria-label="Pagination">`, `aria-current="page"` |
| Alerts | `role="alert"` on `Alert` component |
| Progress | `role="progressbar"` with `aria-valuenow/min/max` |
| Decorative icons | `aria-hidden="true"` |

### Color contrast

- Body text (`--foreground` on `--background`): WCAG AA compliant.
- Muted text (`--muted-foreground`): for secondary content only, not critical info.
- Status colors: always pair `-muted` background with semantic text color in badges.
- Never convey meaning by color alone — always include text or icon.

### Forms

- Every input has a visible `<Label>` or `aria-label`.
- Required fields: visual indicator + screen reader text.
- Error messages are specific and actionable.

### Language

- Root HTML: `lang="id"` (Indonesian).
- User-facing DS copy defaults to Indonesian.

---

## 20. Naming conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| UI primitive | `kebab-case.tsx` in `components/ui/` | `dropdown-menu.tsx` |
| DS component | `kebab-case.tsx` in `design-system/` | `event-card.tsx` |
| Token file | `kebab-case.ts` in `tokens/` | `breakpoints.ts` |
| Layout | `kebab-case.tsx` in `layouts/` | `index.tsx` |
| Barrel export | `index.ts` | `design-system/index.ts` |

### CSS classes

| Pattern | Example | Usage |
|---------|---------|-------|
| `ds-*` | `.ds-heading-2`, `.ds-focus-ring` | Design system utilities |
| `storefront-*` | `.storefront-section` | **Legacy** — do not create new ones |
| Tailwind semantic | `bg-brand`, `text-muted-foreground` | Component styling |

### React components

| Type | Convention | Example |
|------|------------|---------|
| UI primitive | PascalCase, noun | `Button`, `Dialog`, `Table` |
| DS composed | PascalCase, domain noun | `EventCard`, `DsEmptyState` |
| Layout | PascalCase + `Layout` | `DashboardLayout` |
| Variants | camelCase string literals | `variant="primary"`, `size="md"` |

### Props

| Pattern | Example |
|---------|---------|
| Boolean | `loading`, `disabled`, `required`, `sticky` |
| Callbacks | `onClick`, `onPageChange`, `onRetry` |
| Slots | `children`, `footer`, `actions`, `prefixSlot` |
| Accessibility | `label` (IconButton), `id` (FormField) |

### Import aliases

| Alias | Path |
|-------|------|
| `@/design-system` | `src/design-system/index.ts` |
| `@/components/ui/*` | `src/components/ui/*` |
| `@/lib/utils` | `cn()` helper |

### Token naming

```
--{category}           → --brand, --border, --radius-md
--{category}-{state}   → --brand-hover, --primary-active
--{category}-{variant} → --success-muted, --danger-foreground
```

---

## 21. Migration & enforcement

### For new pages

1. Start with the correct **layout shell** from `@/design-system`.
2. Use **`<Container>`** and **`<Grid>`** for page structure.
3. Use **`<Text variant="…">`** for all typography.
4. Import UI controls from **`@/components/ui`**.
5. Use **domain cards** and **state components** from `@/design-system`.
6. Run `npx tsc --noEmit` before PR.

### For existing pages

- Legacy `storefront-*` classes still work — migrate when touching a page.
- `components/common/empty-state.tsx` → migrate to `DsEmptyState`.
- `components/common/list-pagination.tsx` → migrate to `Pagination` when API shape allows.
- Do not bulk-migrate unrelated pages in the same PR as feature work.

### PR checklist

- [ ] No hardcoded colors (`#`, `rgb`, raw Tailwind palette)
- [ ] No ad-hoc typography (`text-xl font-bold`)
- [ ] No new duplicated components (checked DS first)
- [ ] Spacing from 4px scale only
- [ ] Interactive elements have focus styles
- [ ] Icon-only buttons have `label` / `aria-label`
- [ ] Forms use `FormField` or `Label` + validation pattern
- [ ] Responsive tested at 375px, 768px, 1280px
- [ ] TypeScript passes

---

## Quick reference card

```
Colors:     bg-brand | bg-primary | bg-surface | text-muted-foreground
Type:       <Text variant="h2"> | .ds-heading-2
Space:      4px grid → p-4, gap-6, py-12
Radius:     rounded-md (default) | rounded-lg (cards) | rounded-full (badges)
Shadow:     shadow-sm (cards) | shadow-md (hover) | shadow-lg (modals)
Grid:       <Container> + <Grid> → 4 / 8 / 12 cols
Breakpoints: sm 640 | md 768 | lg 1024 | xl 1280 | container 1440
Button:     <Button variant="primary" size="md">
Input:      <FormField> + <Input> | <SearchInput> | <PasswordInput>
Card:       <EventCard> | <Card variant="interactive">
Table:      <Table> + <TableToolbar> + <Pagination>
Focus:      .ds-focus-ring (never remove)
Icons:      Lucide only, size 16–32 via <Icon>
Motion:     duration-normal + ease-out-expo
```

---

*This document reflects the implemented design system in `laristix-web`. For implementation details, see `src/design-system/README.md` and source files referenced above.*
