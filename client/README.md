# Client

React 19 + TypeScript + Vite frontend. See the root `README.md` for the full project, phase plan, and API reference — this file covers just this workspace.

## Design language

A split-flap departures board. Tasks move through stages (`TODO` → `IN PROGRESS` → `DONE`) the way flights move through a manifest, so status and priority render as flap-style mono chips (`FlapChip`), and the dark "board" panel (`bg-board`) is the one recurring signature surface — used deliberately on auth screens and the landing hero, not smeared across every page.

- **Type**: Space Grotesk (display) + IBM Plex Sans (body) + Space Mono (data/status chips)
- **Color tokens**: defined in `src/index.css` via Tailwind v4's CSS-first `@theme` block — `canvas`, `board`, `board-light`, `flap`, `signal`, `signal-dark`, `ink`, `muted`, `line`, `danger`, `success`
- **Motion**: used once per view, not scattered — the manifest panel's staggered row reveal is the one deliberate moment, via `motion` (the rebranded Framer Motion package)

## Stack notes worth knowing

- **TypeScript pinned to 6.0.3** (not the freshly-released 7.x native-rewrite compiler) — same reasoning as the server: consistency over adopting a brand-new major on day one.
- **React Router v8**: the `react-router-dom` package is gone as of v7 — everything (`BrowserRouter`, `Routes`, `Link`, `useNavigate`, etc.) now comes from the single `react-router` package. This app uses declarative mode (`<Routes>`/`<Route>`), not the data/framework modes.
- **Tailwind v4**: CSS-first config — theme tokens live in `src/index.css`, not a `tailwind.config.js`.
- **Zod v4**: schemas use `z.email({ error: '...' })`, not the deprecated `z.string().email({ message: '...' })` form.
- **`@` import alias** resolves to `src/` (configured in both `vite.config.ts` and `tsconfig.json` — they have to agree, since Vite and `tsc` resolve it independently).

## Auth architecture

- **Access token**: kept in memory only, in the Zustand store (`src/store/authStore.ts`) — never `localStorage`, to limit what an XSS bug could steal.
- **Refresh token**: the `httpOnly` cookie the backend sets — this app never touches it directly. `src/services/api.ts` sends it automatically via `withCredentials: true`.
- **On page load**: `useAuthBootstrap` (`src/hooks/`) silently calls `POST /auth/refresh` to trade that cookie for a fresh access token before deciding whether the user is logged in — otherwise every reload would force a re-login even with a perfectly valid session.
- **On a 401**: the response interceptor in `src/services/api.ts` refreshes once and retries the original request — but only for requests that actually carried an access token. A 401 from `/auth/login` on a wrong password is a credential failure, not an expired token, and must not trigger a refresh loop. (This distinction was a real bug caught during integration testing against the live backend — see the root README's verification notes.)

## Routes

| Path | Access | Page |
|---|---|---|
| `/` | public | Landing |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | public | Auth pages |
| `/calendar`, `/settings` | authenticated | Placeholder — real UI in Phase 6 |
| `/tasks` | authenticated | **Functional** — search/filter/sort/paginate, create/edit, comments |
| `/dashboard` | authenticated | **Functional** — stat cards + charts, admin "team stats" toggle |
| `/kanban` | authenticated | **Functional** — drag-and-drop between statuses |
| `/profile` | authenticated | **Functional** — reads the current user from the store |
| `/admin` | authenticated + `role: ADMIN` | **Functional** — global stats + user management table |
| `*` | public | 404 |

Placeholder pages exist so routing, protection, and the app shell (`Navbar`/`Sidebar`) can be verified end-to-end now, without half-building UI that gets rebuilt once its backend-integrated phase arrives.

## Run it

```bash
cp .env.example .env   # VITE_API_URL defaults to the Phase 1/2 server on :5000
npm install
npm run dev             # http://localhost:5173
```

Requires the `server/` API running (see root README) — sign in with the seeded demo accounts, or register a new one.
