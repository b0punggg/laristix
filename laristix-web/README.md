# Laristix Web

Next.js frontend for the Laristix event management platform.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui primitives
- TanStack Query (server state)
- Zustand (client state)
- Axios + Laravel Sanctum SPA authentication

## Requirements

- **Node.js 18.17+** (Next.js 14 requirement)
- Laravel API running (default: `http://laristix.test`)

## Setup

```bash
cd laristix-web
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Leave empty for local dev (uses Next.js proxy). Set to Laravel URL in production. |
| `BACKEND_URL` | Laravel URL for Next.js rewrites (default: `http://laristix.test`) |
| `NEXT_PUBLIC_APP_URL` | This frontend URL (must be in Sanctum stateful domains) |

## Backend (Laravel) checklist

Ensure your Laravel `.env` includes:

```env
APP_URL=http://laristix.test
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1,laristix.test
SESSION_DOMAIN=localhost
```

The frontend proxies `/api` and `/sanctum` through Next.js (`next.config.mjs`), so keep `NEXT_PUBLIC_API_URL` empty in `.env.local`. Direct cross-origin calls from `localhost:3000` to `laristix.test` will fail CSRF checks in the browser.

CORS must allow credentials from the frontend origin (`supports_credentials: true`).

## Project structure

```
src/
├── app/              # Route groups: (public), (auth), (organizer), (admin), (scanner)
├── components/       # ui/, common/, layouts/, features/
├── config/           # env, API paths, route constants
├── hooks/            # TanStack Query auth hooks
├── lib/api/          # Axios client + CSRF helper
├── services/auth/    # Auth API functions
├── stores/           # Zustand stores
└── types/            # Shared TypeScript types
```

## Auth flow

1. `GET /sanctum/csrf-cookie` — obtain CSRF cookie
2. `POST /api/v1/auth/login` — session cookie auth
3. `GET /api/v1/auth/me` — hydrate user + active organizer
4. Optional `X-Organizer-Id` header on API requests

## Phase F1 (this scaffold)

- [x] App shell, providers, API client
- [x] Login, register, forgot/reset password, verify email, organizer picker
- [x] Organizer / admin / scanner route placeholders
- [ ] Event listing, ticketing checkout (future phases)
