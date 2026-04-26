# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

- **Install**: `bun install`
- **Dev** (`make dev`): dev build, then `bun --hot run server/index.ts &` alongside `bun run watch`
- **Build** (`make build`): minified SSR + client builds into `out/server` and `out/client`
- **Build (dev)** (`make build-dev`): same as `build` with `--no-minify`
- **Start** (`make start`): `make build`, then `bun run server/index.ts`

No test or lint commands are wired up. Formatter/linter binaries exist (`oxfmt`, `oxlint`) but have no npm scripts.

## Architecture

SolidJS SSR app served by Bun. The build is a custom `Bun.build()` pipeline (not Vite); the server is `Bun.serve()` (not Hono/Express).

### Build (`build.ts`)

Single script driven by `parseArgs` flags (`--ssr`, `--target`, `--entrypoints`, `--outdir`, `--minify`). Two invocations produce the two bundles:

- **SSR bundle** → `out/server/entry.server.js` (target `bun`, Solid `generate: "ssr"`, `hydratable: true`)
- **Client bundle** → `out/client/*` from `index.html` as the HTML entrypoint (target `browser`, Solid `generate: "dom"`)

Plugins:

- `solid-plugin` — Babel `babel-preset-solid` transform on `.tsx`/`.jsx`, toggles SSR vs. DOM codegen via the `--ssr` flag.
- `transform-html-plugin` — lowercases tags and replaces the `<!-- INJECT_IMPORTMAP -->` comment in [index.html](index.html) with a `<script type="importmap">` pointing Solid + router + meta at `esm.sh` CDN URLs. The importmap is defined inline in [build.ts](build.ts); bump versions there and in [package.json](package.json) together.

Each build clears `outdir`, emits `meta.json` with the metafile, and copies `public/` into the client outdir.

### Server (`server/index.ts`)

`Bun.serve()` with route handlers on port 3003:

- `/chunks/*`, `/assets/*`, `/favicon.ico` — serve files out of `out/client/` (chunks run through [server/compress.ts](server/compress.ts) for br/gzip/zstd/deflate).
- `/api/users` — sample JSON endpoint.
- `fetch` fallback — streams SSR HTML: reads `out/client/index.html` as a template split on `<!--app-head-->` and `<!--app-body-->`, dynamically imports `../out/server/entry.server.js`, and pipes the rendered body between the template halves.

Note: file paths in handlers (`./out/client/...`) are cwd-relative, so the server must be launched from the repo root (both `make dev` and `make start` do this). The dynamic SSR import uses a module-relative path (`../out/...`) and is re-evaluated per request, so rebuilt SSR is picked up without restarting.

### Watcher (`watch.ts`)

Watches `./src` recursively and runs `make build-dev` on change. SIGINT closes the watcher. The `--hot` server is started as a sibling process by the makefile (`bun --hot run server/index.ts & bun run watch`); Ctrl-C in the terminal signals the whole process group, stopping both.

Dev-loop gotcha: Bun's `--hot` flag cannot be enabled via the `Bun.serve()` API, which is why the server and watcher run as two sibling processes instead of one.

### Frontend (`src/`)

- [entry.server.tsx](src/entry.server.tsx) — `renderToStream` wrapped in `provideRequestEvent`; returns `{ body, head }` where `head` awaits the shell and emits assets + hydration script.
- [entry.client.tsx](src/entry.client.tsx) — `hydrate()` into `document.body` with `renderId: "main"`.
- [root.tsx](src/root.tsx) — `@solidjs/router` routes (`/`, `/test`, `*`), `@solidjs/meta` providers, `RootLayout` with nav links.
- `pages/` — route components (lazy-loaded).
- `assets/` — static imports (SVG/AVIF).

## Key configuration

- **TypeScript** ([tsconfig.json](tsconfig.json)): strict, ESNext, `moduleResolution: bundler`, `jsx: preserve` + `jsxImportSource: solid-js`, `@/*` alias maps to repo root (e.g. `@/src/root`, `@/server/compress`) — **not** to `src/`.
- **bunfig.toml**: `install.exact = true` — pin exact versions when adding deps.
- **Asset imports**: `.svg`, `.module.css`, `.avif` typed in [bun-env.d.ts](bun-env.d.ts).
- **Env vars**: only `PUBLIC_*` are inlined into bundles (see `env: "PUBLIC_*"` in [build.ts](build.ts)).
