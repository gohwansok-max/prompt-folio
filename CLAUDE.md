# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `packageManager` in `package.json`; a patched `wouter` dependency lives in `patches/`, applied automatically by pnpm on install).

- `pnpm install` — install dependencies
- `pnpm dev` — start the Vite dev server (`--host`, port 3000, falls back to next free port)
- `pnpm build` — type-checks nothing itself; builds the client with Vite into `dist/public`, then bundles `server/index.ts` with esbuild into `dist/index.js`
- `pnpm start` — run the production server (`node dist/index.js`) against the built `dist/public` assets
- `pnpm preview` — preview the Vite production build
- `pnpm check` — `tsc --noEmit`, the project's only type-check step (no separate lint script)
- `pnpm format` — Prettier write across the repo

There is no test runner wired to `package.json` scripts (vitest is a devDependency but no `test` script or `*.test.ts` files currently exist — `tsconfig.json` explicitly excludes `**/*.test.ts`). If you add tests, run them directly via `pnpm exec vitest`.

## Architecture

This is **Prompt Folio**, a client-only, localStorage-backed single-page app (no real backend, no database) for drafting AI prompts/notes, auto-tagging them, and — per newer features under `entities/` — assembling reusable "agent" and "skill" records into exportable AI harness/config files for different coding-agent platforms (Claude Code, Codex, Gemini CLI, etc.).

### Deployment model (important — shapes a lot of decisions)

- Ships as a **static site to GitHub Pages** via `.github/workflows/deploy.yml`: on push to `main`, it builds with `VITE_BASE_PATH=/prompt-folio/` and publishes `dist/public` to the `gh-pages` branch.
- `server/` (Express) exists only to serve the built static files for local `pnpm start` / non-Pages hosting — it has no API routes, no database, and isn't part of the GitHub Pages deployment. Don't assume server-side logic can be added without also solving where it would actually run.
- All application state — library entries, tags, feedback history, onboarding progress, API keys — lives in **`window.localStorage`**, keyed per-browser. There is no sync between devices/users. `client/src/const.ts` / `getLoginUrl()` and the OAuth/session scaffolding are unused leftovers from the app template — this app does not do server-side auth.
- Optional AI calls go directly from the browser to a third-party OpenAI-compatible endpoint (see `api-integration-notes.md`: CheapAI, `https://api.cheapai.im/v1`). The user's API key is stored only in their browser's localStorage, never bundled into source or committed.

### Data layer: v1 vs v2, and the in-place migration

The codebase is mid-migration between two data models, both coexisting in localStorage:

- **v1 ("library")**: `features/library/storage.ts`, key `prompt-folio-library-v1`. A single flat list of `SavedEntry` items (`kind: "profile" | ...`) with ad-hoc tag/feedback state under sibling keys in `features/tag-system/` and `features/prompt-optimizer/` (all keyed `prompt-folio-*-v1`). This is what the current UI (Home, Library, tag system, prompt coach/optimizer, reports) reads and writes.
- **v2 ("Harness Studio")**: `entities/agent`, `entities/skill`, `entities/harness`, `entities/context`, `entities/rule` — typed records (`AgentRecord`, `SkillRecord`, `HarnessRecord`, ...) under keys like `harness-studio-agents-v2`. These are new entities (see the `// V2 entity` comments in `entities/*/types.ts`) that back `pages/AgentBuilderPage.tsx` and `pages/HarnessGeneratorPage.tsx`, and are **not** yet fully wired into the rest of the UI.
- `entities/migration/runMigration.ts` runs once per browser (guarded by `MIGRATION_STATUS_KEY`) on every app boot (`App.tsx` `useEffect`). It **reads** all v1 keys, snapshots them to a backup key, and **writes** derived v2 `AgentRecord`/`SkillRecord` entries — it never mutates or deletes v1 data, so v1 features keep working unchanged. When adding new v1-facing features, do not assume v2 records are populated or authoritative; when working on Harness Studio (agents/skills/harness) features, remember any given browser's v2 store may be freshly migrated, partially reviewed (`status: "draft" | "confirmed"`), or empty.
- localStorage key naming convention: `<app>-<feature>-v<version>`, defined as an exported `*_KEY` constant next to the type it stores (see `entities/agent/storage.ts`, `features/tag-system/constants.ts`). Reuse this pattern — don't hardcode key strings inline. Storage helpers (`read*`/`write*`) validate/guard against `typeof window === "undefined"` and malformed JSON before returning, since this is a browser-only app with no SSR.

### Directory layout (feature-based, not by file type)

- `client/src/entities/<name>/` — v2 domain types + storage + migration helpers for a data entity (agent, skill, harness, context, rule). No UI here.
- `client/src/features/<name>/` — a self-contained feature: `types.ts`, `storage.ts` and/or `lib.ts` (pure logic), `constants.ts`, and a `components/` folder for its UI. Cross-feature imports do happen (e.g. migration reads several features' storage constants) but keep new logic scoped to its owning feature.
- `client/src/pages/` — route-level components wired up in `App.tsx`'s `<Switch>`; one page per feature area (Home, Dashboard, AgentBuilder, HarnessGenerator, Library, Settings).
- `client/src/shared/` and `client/src/lib/`, `client/src/hooks/` — cross-feature utilities (`shared/lib`, `lib/utils.ts` for `cn()`/shadcn helpers, custom hooks like `usePersistFn`, `useMobile`).
- `client/src/components/ui/` — shadcn/ui primitives (see `components.json`: style `new-york`, no RSC, path aliases below). Prefer composing these over hand-rolling new primitives.
- `shared/` (repo root, not under `client/`) — the few constants genuinely shared between client and server (`shared/const.ts`).

### Path aliases (`vite.config.ts` + `tsconfig.json`)

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/` (referenced in config; directory may not exist unless assets were attached)

### Routing

`wouter` (not react-router), with a `base` derived from `import.meta.env.BASE_URL` so routing works both at `/` (dev) and under `/prompt-folio/` (GitHub Pages prod). When adding a route, register it both as a `<Route>` in `App.tsx` and as a page in `client/src/pages/`.

### Styling

Tailwind CSS v4 (via `@tailwindcss/vite`, not a `tailwind.config` JS file) with shadcn/ui. Light/dark theme is app-level, not OS-level: `contexts/ThemeContext.tsx` (`switchable`, default `"light"`), persisted to localStorage — see the `NOTE: About Theme` comment in `App.tsx` before changing default theme or making a feature theme-aware.

### Language/locale note

Most UI copy, tag taxonomies (e.g. `features/tag-system/constants.ts`), and product notes (`api-integration-notes.md`, `deployment-notes.md`, `todo.md`) are in Korean, targeting Korean-language users (food QC/HACCP professionals per the tag set, plus general prompt-authoring use cases). Keep new user-facing strings and tag/keyword lists consistent with this — don't switch existing copy to English.

### Non-source docs worth knowing about (not code, but track project state)

- `todo.md` — running, mostly-checked-off feature backlog in Korean.
- `deployment-notes.md` — a manually-maintained log of what was deployed to GitHub Pages and when.
- `api-integration-notes.md` — the CheapAI API contract this app talks to from the browser.
- `ideas.md` — design/brand exploration notes, not implementation guidance.

These are historical/status logs, not specs to satisfy — don't treat unchecked `todo.md` items as implicit instructions unless the user asks for them.
