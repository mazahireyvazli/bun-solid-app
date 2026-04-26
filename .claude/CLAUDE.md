# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

- **Install**: `bun install`
- **Dev** (`make dev`): dev build, then `bun --watch run ./out/server/main.dev.js` alongside `bun run ./build/watch.ts`
- **Build** (`make build`): minified SSR + client builds into `out/server` and `out/client`
- **Build (dev)** (`make build-dev`): same as `build` with `--no-minify` and `--features=IS_DEV`
- **Start** (`make start`): `make build`, then `NODE_ENV=production bun ./out/server/main.js`
- **Fix** (`make fix`): runs `oxfmt` formatter then `oxlint` with type-aware fixes

No test commands are wired up.

## After making changes

After editing source files:

1. Run `make fix` — formats code and surfaces lint/type warnings.
2. Run `make build-dev` — verifies the build compiles cleanly.

Do not run any other commands (e.g. starting the server) unless the user explicitly asks.

## Architecture

SolidJS 2.0 beta SSR app served by Bun. The build is a custom `Bun.build()` pipeline (not Vite); the server uses Bun's native `serve()` with typed route handlers (not Hono/Express).

### Build (`build/build.ts`)

Single script driven by `parseArgs` flags (`--ssr`, `--target`, `--entrypoints`, `--outdir`, `--minify`, `--features`). Two invocations per build:

- **Client bundle** → `out/client/*` from `src/index.html` as the HTML entrypoint (target `browser`, Solid `generate: "dom"`)
- **SSR bundle** → `out/server/main[.dev].js` from `server/main[.dev].ts` (target `bun`, Solid `generate: "ssr"`, `hydratable: true`)

Plugins in `build/`:

- `solid-plugin` — Babel `babel-preset-solid` transform on `.tsx`/`.jsx`, toggles SSR vs. DOM codegen via the `--ssr` flag.
- `lazy.bun.plugin` / `lazy.babel.plugin` — supports `ssrLazy` (see below).
- CSS loader (`build/loaders/css.loader.ts`) — bundles `.css?inline` imports via LightningCSS.
- SVG loader (`build/loaders/svg.loader.ts`) — handles `.svg?inline` imports.
- `transform-html-plugin` — inlines `<script inline src="...">` and `<style inline src="...">` tags directly into `index.html`, and replaces the `<script type="importmap">` placeholder with live CDN URLs from `esm.sh`. Bump versions in `build/build.ts` importmap and `package.json` together.

Each build emits `meta.json`. The client build also emits `manifest.json` (used by SSR for asset injection) and copies `public/` into the outdir.

### Server (`server/`)

- `server/main.ts` — production server. Reads `out/client/index.html` once at startup, splits on `<!--app-head-->` / `<!--app-body-->`, and streams SSR HTML per request.
- `server/main.dev.ts` — dev server. Same logic but re-reads the template per request (picks up rebuilds without restart). Uses `development: true`.
- `server/routes.ts` — typed `Bun.serve()` route handlers:
  - `/_serverfn/:name` — server function dispatcher (POST)
  - `/chunks/*`, `/assets/*` — serve `out/client/` with cache headers; optional br/gzip/zstd compression via `server/compress.ts` when `COMPRESSION=ENABLED`
  - `/favicon.ico`, `/robots.txt`, `/.well-known/*` — static file serving
  - `fetch` fallback in `main.ts` — SSR catch-all
- `server/serverfn.ts` — server function registry

Port is read from `process.env.PORT`.

### Frontend (`src/`)

- `entry.server.tsx` — `renderToStream` wrapped in `provideRequestEvent`; returns `{ body, head }`. Head awaits then emits `getAssets() + generateHydrationScript()`.
- `entry.client.tsx` — `hydrate()` into `document.body` with `renderId: RENDER_ID`.
- `root.tsx` — `@solidjs/router` routes, `@solidjs/meta` providers (via custom `metahead.tsx`), `RootLayout` (Header + children + Footer).
- `pages/` — route components (lazy-loaded via `ssrLazy`).
- `components/` — shared UI components.
- `assets/` — static imports (SVG/AVIF/CSS).
- `libs/` — app utilities (see below).

### Key libs

- `libs/ssr_lazy.ts` — `ssrLazy(fn)`: wraps Solid's `lazy()` and pre-calls `.preload()` on the server (where `feature("SSR")` is true) so components are resolved before streaming begins. Use this instead of `lazy()` everywhere in route definitions.
- `libs/metahead.tsx` — custom `<Title>`, `<Meta>`, `<Link>`, `<Style>` with SSR deduplication.
- `libs/createSignalStorage.ts` — Solid signal backed by `localStorage` with cross-tab sync.
- `libs/call_serverfn.ts` — isomorphic server-function caller (direct import on SSR, `fetch` on client).
- `libs/lifecycle.ts` — `createIsMounted()`, `isHydrated()`.

### Routing structure

```
/                          → HomePage
*                          → 404
```

Each route's component and styles are loaded via `ssrLazy`. Styles are rendered as inline `<style>` tags co-located with their component.

### CSS conventions

- `src/assets/css/global.css` — global reset, design tokens as CSS custom properties, base element styles. Inlined into `<head>` via `<style inline src="...">`.
- Per-component CSS is co-located (`style.css`) and loaded via a sibling `css.tsx` that exports `() => <style textContent={css} />`. Components import this via `ssrLazy`.
- All colors use the native `light-dark()` CSS function. Dark mode is applied by setting `color-scheme: dark` on `[data-theme="dark"]` (set synchronously by an inline script in `<head>`).
- No CSS-in-JS, no CSS modules, no utility frameworks.

## Key configuration

- **TypeScript** (`tsconfig.json`): strict, ESNext, `moduleResolution: bundler`, `jsx: preserve` + `jsxImportSource: @solidjs/web`, `@/*` alias maps to repo root — **not** to `src/`.
- **bunfig.toml**: `install.exact = true` — pin exact versions when adding deps.
- **Asset imports**: `.svg`, `.module.css`, `.avif` typed in `bun-env.d.ts`.
- **Env vars**: only `PUBLIC_*` are inlined into bundles (`env: "PUBLIC_*"` in `build/build.ts`). Runtime vars: `PORT`, `COMPRESSION`, `ASSETS_CACHE_MAX_AGE`.

## Skills

Two Claude Code skills are available in `.claude/skills/`:

- **`solidjsv2`** — authoring and migration guide for Solid 2.0 beta. Read topic files on demand (e.g. `effects.md`, `control-flow.md`). Key gotchas: `For` children receive accessors (`item()`), `createEffect` is split into compute/apply, `onMount` → `onSettled`, `Loading` replaces `Suspense`, `Errored` replaces `ErrorBoundary`.
- **`bun`** — Bun runtime, package manager, and API patterns. Prefer `Bun.serve`, `Bun.file`, `bun:sqlite` over Node.js equivalents.
