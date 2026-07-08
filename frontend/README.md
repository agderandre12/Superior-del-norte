# Frontend — Instituto Superior del Norte LMS

React 19 + Vite + TypeScript single-page app for the food-handling course LMS:
public landing page, public diploma verification portal, student campus, and
admin panel.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (HMR) on `http://localhost:5173`. |
| `npm run build` | Type-check-free production build into `dist/`. |
| `npm run lint` | ESLint (flat config). |
| `npm run preview` | Preview the production build locally. |

> Type-checking: run `npx tsc --noEmit` before committing — it is **not** part of
> the build script today.

## Environment

Copy `.env.example` to `.env` and adjust:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Absolute base URL of the backend API (e.g. `https://api.institutosuperiordelnorte.co/api`). Defaults to `http://localhost:5000/api`. **Must** be set at build time for deployment. |
| `VITE_API_PROXY_TARGET` | Used only by the Vite dev proxy (`vite.config.js`) to forward `/api` to the backend. |

Only variables prefixed with `VITE_` are exposed to the browser bundle — never
put secrets here.

## Architecture (summary)

- **State:** `src/context/AppContext.tsx` (Context API). Centralizes auth,
  student courses, modules, progress, exam, and admin operations. The JWT is
  stored in `localStorage` (see known limitations in `.gemini/` docs).
- **Routing:** React Router DOM (`HashRouter`) in `src/App.tsx`. Routes are the
  single source of truth for navigation; `<ProtectedRoute allowRoles={...}>`
  guards private views.
- **Public diploma verification:** `src/components/VerifyCertificate.tsx` and the
  inline form in `HomePage.tsx` both call `GET /api/certificate/verify/:codigo`.
  The code is `encodeURIComponent`-d; loading / success / empty / error states
  are all handled explicitly (no fabricated fallback data).
- **HTML sanitization:** any admin-authored HTML rendered via
  `dangerouslySetInnerHTML` (certificate templates, module content) is first
  passed through `sanitizeHtml()` in `src/utils/sanitize.ts` (DOMPurify).

See `.gemini/arquitectura_y_diseño.md` for the full architecture, routing table,
and database schema.
