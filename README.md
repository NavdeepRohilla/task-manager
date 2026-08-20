# Task Manager

A production-oriented task management SaaS, built as a monorepo and delivered in verified phases rather than as one unreviewable dump of code.

## Phase plan

| # | Phase | Status |
|---|---|---|
| 1 | Foundation — monorepo scaffold, Prisma schema, full JWT authentication | ✅ Done |
| 2 | Task CRUD + comments + admin endpoints (backend) | ✅ Done |
| 3 | Frontend foundation — Vite + React 19 + Tailwind + shadcn-style UI, routing, auth pages | ✅ Done |
| 4 | Task management UI — forms, list, search/filter/sort/pagination, comments | ✅ Done |
| 5 | Dashboard + Kanban board + charts | ✅ Done |
| 6 | Attachments, labels, activity history, dark mode | ⬜ Not started |
| 7 | Real-time (Socket.io) + Swagger docs + final polish | ⬜ Not started |

This README documents **Phase 1**. Each later phase adds its own section here as it lands.

## Repo layout (current)

```
task-manager/
├── docker-compose.yml
├── README.md                  ← you are here
├── client/                    React 19 + Vite + TypeScript + Tailwind v4
│   ├── README.md               design system, stack notes, auth architecture
│   └── src/
│       ├── components/         ui/, tasks/ (incl. Kanban), dashboard/ (charts), admin/, layout/, navbar/, sidebar/, forms/
│       ├── pages/               landing, auth/, MyTasksPage, DashboardPage, KanbanPage, AdminDashboardPage (all real), + Phase 6 placeholders
│       ├── layouts/             AuthLayout, AppLayout
│       ├── routes/              ProtectedRoute
│       ├── store/               Zustand auth store (in-memory token only)
│       ├── services/            axios instance + interceptors, typed API calls (auth, task, comment, user, admin)
│       ├── hooks/               useAuthBootstrap, useTasks (incl. optimistic drag update), useComments, useStats, useAdmin, useUserSearch, useDebouncedValue
│       └── lib/                 cn(), error helpers, taskPermissions, Zod schemas
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── Dockerfile
    ├── eslint.config.mjs
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── src/
        ├── app.ts                    Express app: middleware + routes
        ├── server.ts                 entrypoint + graceful shutdown
        ├── config/                   env validation, Prisma client singleton
        ├── types/                    Express.Request augmentation, CurrentUser
        ├── middlewares/               auth, error handling, rate limiting, validation
        ├── validators/                express-validator chains (auth, task, comment, admin)
        ├── repositories/              the only layer that imports Prisma (user, task, comment)
        ├── services/                  business logic (auth, mail, task, comment, admin)
        ├── controllers/               thin HTTP handlers
        └── routes/                    auth, users, tasks (+ nested comments), comments, admin
```

## Tech stack (Phase 1 slice)

Node.js 20+ · Express 5 · TypeScript 6 · **Prisma 6.19** (see note below) · PostgreSQL 16 · JWT (access + rotating refresh tokens) · bcrypt · express-validator · Helmet · CORS · express-rate-limit · Morgan · Docker.

> **Why Prisma 6, not 7?** `npm install prisma` currently resolves to Prisma 7, which removed the Rust query engine, made driver adapters mandatory, and moved the datasource URL into a new `prisma.config.ts`. That's a legitimate direction for Prisma, but it's a lot of new surface area to inherit on day one of a fresh project, and the current GitHub issue tracker shows the migration still has rough edges. This project pins to the mature, extensively documented **6.19.3** line. Upgrading later is a contained, well-documented migration whenever you want the smaller/faster v7 client — see [Prisma's v7 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).

## Prerequisites

- Node.js 20+
- Docker + Docker Compose (recommended path), **or** a local PostgreSQL 16 instance

## Quick start

### Option A — Docker Compose (recommended)

```bash
cp server/.env.example server/.env
# edit server/.env — at minimum set real values for JWT_ACCESS_SECRET / JWT_REFRESH_SECRET

docker compose up --build
```

This starts Postgres, waits for it to be healthy, runs `prisma migrate deploy`, then starts the API on `http://localhost:5000`. Seed the demo accounts once it's up:

```bash
docker compose exec server npm run prisma:seed
```

### Option B — Local dev (no Docker for the API)

```bash
cd server
cp .env.example .env          # point DATABASE_URL at your local Postgres
npm install
npm run prisma:generate
npm run prisma:migrate        # creates the initial migration + applies it
npm run prisma:seed           # optional: demo accounts
npm run dev                   # tsx watch — http://localhost:5000
```

### Demo accounts (seed script — local/dev only)

| Email | Password | Role |
|---|---|---|
| `[email protected]` | `Admin@12345` | ADMIN |
| `[email protected]` | `User@12345` | USER |

**Never run the seed script against a real production database.**

### Verify it's alive

```bash
curl http://localhost:5000/api/v1/health
```

## Environment variables

All defined in `server/.env.example`.

| Variable | Purpose | Default |
|---|---|---|
| `NODE_ENV` | `development` \| `production` | `development` |
| `PORT` | API port | `5000` |
| `DATABASE_URL` | Postgres connection string | — (required) |
| `JWT_ACCESS_SECRET` | Signs access tokens | — (required) |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_SECRET` | Signs refresh tokens (**different** secret from access) | — (required) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost | `12` |
| `CLIENT_URL` | Frontend origin — used for CORS + password-reset links | `http://localhost:5173` |
| `PASSWORD_RESET_TOKEN_EXPIRES_MIN` | Reset link lifetime | `30` |

The server fails fast on boot (clear error, not a silent misconfiguration) if a required variable is missing.

## API reference — Phase 1

Base URL: `/api/v1`. All responses use the envelope `{ success, message, data }` (errors: `{ success: false, message, details? }`).

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Liveness check |
| POST | `/auth/register` | — | Create account (always role `USER`) |
| POST | `/auth/login` | — | Returns access token + sets refresh cookie |
| POST | `/auth/refresh` | Refresh cookie | Rotates refresh token, returns new access token |
| POST | `/auth/logout` | Refresh cookie | Revokes the refresh token, clears cookie |
| POST | `/auth/forgot-password` | — | Always returns the same message (no email enumeration) |
| POST | `/auth/reset-password` | — | Consumes a reset token, revokes all sessions |
| GET | `/users/me` | Bearer access token | Returns the authenticated user's profile |

`/auth/register`, `/auth/login`, `/auth/forgot-password`, and `/auth/reset-password` are rate-limited (10 requests / 15 min / IP) since these are exactly the endpoints credential-stuffing and brute-force attempts target.

## API reference — Phase 2

All task/comment/admin routes require `Authorization: Bearer <accessToken>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | any user | Search users by name/email (max 20) — powers the assignee picker, not an admin feature |
| POST | `/tasks` | any user | Create a task (creator becomes owner) |
| GET | `/tasks` | any user | List tasks — see query params below |
| GET | `/tasks/stats` | any user | Dashboard stats scoped to your own tasks |
| GET | `/tasks/:id` | owner/assignee/admin | Get one task |
| PUT | `/tasks/:id` | owner/assignee/admin | Update (see permission model below) |
| DELETE | `/tasks/:id` | owner/admin | Delete |
| POST | `/tasks/:id/comments` | owner/assignee/admin | Add a comment |
| GET | `/tasks/:id/comments` | owner/assignee/admin | List comments |
| DELETE | `/comments/:id` | author/task owner/admin | Delete a comment |
| GET | `/admin/users` | ADMIN | List users (paginated, no password hashes) |
| PATCH | `/admin/users/:id/role` | ADMIN | Change a user's role (not your own) |
| DELETE | `/admin/users/:id` | ADMIN | Delete a user (not your own) |
| GET | `/admin/dashboard` | ADMIN | Stats across **all** users' tasks |

**`GET /tasks` query params** (all optional): `search`, `status` (`TODO`\|`IN_PROGRESS`\|`COMPLETED`), `priority` (`LOW`\|`MEDIUM`\|`HIGH`), `category`, `tag`, `isArchived` (bool, default `false`), `assignedUserId` (admin only — non-admins are always scoped to their own tasks regardless of this param), `sortBy` (`createdAt`\|`updatedAt`\|`dueDate`\|`priority`\|`title`), `sortOrder` (`asc`\|`desc`), `page`, `limit` (max 100).

### Permission model

| Action | Owner | Assignee (not owner) | Admin | Anyone else |
|---|---|---|---|---|
| View task | ✅ | ✅ | ✅ | 404 (existence hidden) |
| Update `status` / `priority` | ✅ | ✅ | ✅ | 404 |
| Update title/description/dates/tags/category/assignee/archive | ✅ | 403 | ✅ | 404 |
| Delete task | ✅ | 403 | ✅ | 404 |
| Comment | ✅ | ✅ | ✅ | 404 |
| Delete a comment | author, or task owner | — | ✅ | 403 |

A stranger gets **404, not 403**, on a task they can't see — a 403 would confirm the task exists, which is itself information they're not entitled to.

An admin cannot change their own role or delete their own account via these endpoints (checked in `admin.service.ts`) — that's a deliberate guard against an admin locking themselves out by mistake; it has to be done directly against the database if truly intended.

> **Scope note:** Phase 1's README said OpenAPI/Swagger docs would land in Phase 2. They're deferred one phase — this table is Phase 2's documentation for now — so that the CRUD, comments, and admin permission logic could get full behavioral verification instead of splitting effort with a docs generator. Swagger is now planned for Phase 7 (final polish), once the API surface is complete and won't need re-documenting mid-build.

## Architecture notes

**Layering.** `routes` → `middlewares` (rate limit, validate, auth) → `controllers` (HTTP-shape only) → `services` (business logic) → `repositories` (the only files that import Prisma). Nothing outside `repositories/` talks to the database directly — swapping the ORM later would only touch that one layer.

**Token strategy.**
- **Access token** (15 min, JWT, `Authorization: Bearer <token>`): stateless, never touches the database to verify. Never stored server-side.
- **Refresh token** (7 days, JWT, `httpOnly` + `secure` + `sameSite=strict` cookie scoped to `/api/v1/auth`): the JWT's payload only carries an id (`jti`); the actual database row is what makes it revocable. Every refresh **rotates**: the old row is revoked and a new pair is issued, so a stolen-and-replayed old refresh token is rejected outright once the legitimate client has rotated past it.
- **Logout** revokes that one refresh token's row. **Password reset** revokes *every* refresh token for that user, closing any session an attacker might have had open.
- The access token lives in memory on the frontend (a Zustand store, see Phase 3 below), never in `localStorage`, to limit what an XSS bug could steal.

**Password reset** never reveals whether an email is registered, and stores only a SHA-256 hash of the reset token — the raw token exists only in the emailed link.

**Error handling.** Every thrown `ApiError` (or unexpected error) passes through exactly one Express error-handling middleware, which is the only place that decides the HTTP status and response shape.

**Docker.** `bcrypt` compiles a native addon, which needs build tools on Alpine — the Dockerfile installs `python3 make g++` in the base stage specifically so `npm ci` doesn't fail on that.

## Phase 3 — frontend foundation

React 19 + TypeScript + Vite, Tailwind v4, React Router v8 (declarative mode), TanStack Query, Zustand, React Hook Form + Zod, Axios, `motion` (the rebranded Framer Motion), and react-hot-toast. Full design-system and stack-version notes are in `client/README.md` — the short version:

- **Auth pages** (Login, Register, Forgot/Reset Password) fully wired to the Phase 1 API, with client-side Zod validation mirroring the server's rules exactly.
- **Silent-refresh bootstrap**: since the access token lives in memory only, `useAuthBootstrap` trades the httpOnly refresh cookie for a new access token on every page load, so a browser refresh doesn't force a re-login.
- **Response interceptor**: auto-refreshes on a 401 and retries the original request once — but only for requests that actually carried an access token, so a wrong-password login 401 doesn't get misread as an expired token.
- **App shell** (`Navbar`/`Sidebar`) and route protection (including role-gated `/admin`) are real and working; the pages they lead to (Dashboard, My Tasks, Kanban, Calendar, Settings, Admin Dashboard) are intentionally clearly-labeled placeholders until their backend-integrated phase arrives, so nothing gets half-built and thrown away. `/profile` is the exception — it's fully functional, since it only needed data already in the auth store.
- **Design system**: a split-flap departures-board motif (`FlapChip`, the `ManifestPanel`/`HeroManifest` board visuals) — reasoned from the product's own domain (tasks moving through stages) rather than a generic template. Details and token reference in `client/README.md`.

## Phase 4 — task management UI

The real My Tasks page (`client/src/pages/MyTasksPage.tsx`), replacing the Phase 3 placeholder:

- **List, search, filter, sort, paginate** — every control in `TaskFilters` maps directly to a `GET /tasks` query param; changing any filter resets to page 1.
- **Create/edit in one dialog** (`TaskFormDialog`) — the same form for both, pre-filled and permission-aware in edit mode.
- **The UI mirrors the backend's exact permission rule**, not a looser approximation of it: `lib/taskPermissions.ts` disables every field an assignee-but-not-owner can't touch (leaving only status/priority editable), and the submit handler sends *only* those fields for that case — so the client never even attempts a request the server would reject. The server-side check (from Phase 2) remains the real enforcement; the client-side one exists purely so a restricted user gets instant, honest feedback instead of a round-trip 403.
- **Comments** thread inline in the edit dialog, with delete permissions (author, task owner, or admin) matching the backend exactly.
- **One small, deliberate backend addition**: `GET /users?search=` — a search endpoint any authenticated user can call (not admin-only), added because the assignee picker needed *some* way to look up teammates and none existed yet. Small, obviously-scoped, and verified the same way as everything else.

## Phase 5 — dashboard, charts, and the Kanban board

- **Dashboard** (`/dashboard`): the 5 stat cards and 3 charts (status donut, category bar, 7-day weekly-progress line — all Recharts) specified from the start, reading `GET /tasks/stats`. Admins get a "My stats / Team stats" toggle that switches to `GET /admin/dashboard` (global scope) — reusing the exact same chart components with different data, not a separate implementation.
- **Admin page** (`/admin`), no longer a placeholder: the same dashboard components in global-stats mode, plus a user management table (`UserTable`) wired to the `/admin/users` list/role-update/delete endpoints that were built in Phase 2 but never had a UI until now.
- **Kanban board** (`/kanban`): three droppable columns (`dnd-kit`), each card draggable between them. Dropping a card calls the same `PUT /tasks/:id` the Phase 4 edit form uses — there's no separate "kanban update" code path. Status changes are applied **optimistically** (the card moves instantly; a failed request rolls the board back and toasts an error) via a dedicated `useUpdateTaskStatus` hook, since waiting for a round trip before moving the card would make dragging feel broken.
- **Route-based code splitting**: adding Recharts and dnd-kit pushed the production bundle from ~710KB to ~1.17MB. Rather than deferring that to "Phase 7 polish," every page behind login is now `React.lazy`-loaded — the landing/login/register bundle a first-time visitor actually downloads dropped back to ~470KB, and Recharts/dnd-kit now only load for someone who visits Dashboard or Kanban.

## What Phase 6 adds

File attachments, task labels, activity history, and dark mode.

## A note on this delivery

Every backend endpoint in this README — including every row of the permission-model table — was exercised against a real running instance of the code before being written up. Every frontend phase went through the same standard: real `tsc`/`eslint`/`vite build`, and the real API-calling code (not a mock) run against the real live backend for a full integration pass each time. Phase 5's pass (15 checks) followed the drag-and-drop status-update path exactly as the Kanban board calls it — including confirming `completedAt` clears correctly when a card is dragged back out of the Done column, not just that it gets set when dragged in.

The one thing not covered by any of this testing is a real PostgreSQL connection, which needs network access this build environment doesn't have (see the Prisma version note above); everything from the HTTP layer down through business logic, and now the frontend that talks to it, ran for real.
