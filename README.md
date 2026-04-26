# Bun + Solid

A modern, lightweight full-stack web application starter built with **Solid.js v2** and **Bun**. No bloat, no complex build tools—just fast development and production-ready output.

## Features

- **Solid.js v2 SSR** — Server-side rendering out of the box with hydration support
- **Bun as runtime and bundler** — Single, unified JavaScript runtime. No Vite or webpack needed
- **Custom build pipeline** — Bun's native `Bun.build()` API handles SSR and client bundles
- **Lazy-loaded routes** — Only load code that's needed
- **TypeScript support** — Full type safety across server and client

## Quick Start

### Requirements

- [Bun](https://bun.com) v1.3+

### Install dependencies

```bash
bun install
```

### Development

Start the dev server:

```bash
make dev
```

Opens http://localhost:3003. The watcher rebuilds on file changes.

### Production build

```bash
make build
```

Generates minified SSR and client bundles to `out/`.

### Run production server

```bash
make start
```

Builds and serves the app on http://localhost:3003.

## Commands

| Command          | Description                            |
| ---------------- | -------------------------------------- |
| `make dev`       | Start dev server (rebuilds on changes) |
| `make build`     | Production build (minified)            |
| `make build-dev` | Dev build (unminified, faster)         |
| `make start`     | Build and run production server        |

## Project Structure

```
src/
├── pages/              # Route components (lazy-loaded)
├── components/         # Reusable UI components
├── assets/             # Images, SVGs, stylesheets
├── libs/               # Shared utilities
├── entry.client.tsx    # Client hydration entry
└── entry.server.tsx    # Server render entry

server/
├── index.ts            # HTTP server (Bun.serve)
└── compress.ts         # Response compression

build/
└── build.ts            # Custom Bun.build() pipeline
```

## How It Works

### Build System

The custom build pipeline creates two optimized bundles:

- **SSR bundle** — Renders on the server for faster First Contentful Paint
- **Client bundle** — Hydrates in the browser for interactivity

Both bundles are built in seconds using Bun's native bundler—no complex configuration needed.

### Development

The dev mode watches `src/` for changes and rebuilds automatically. The server picks up SSR changes instantly without restarting.

### Styling

- **Global styles** — `src/assets/css/global.css`
- **Page styles** — Page-specific CSS co-located with components

## Performance

- ⚡ Bun's bundler is **significantly faster** than Vite
- 📦 Lazy-loaded routes reduce initial bundle size
- 🎨 SSR enables faster First Contentful Paint

## Configuration

- **TypeScript** — Strict mode, ESNext target
- **Module alias** — `@/*` maps to project root
- **Environment variables** — `PUBLIC_*` vars are included in client bundle, other vars in server bundle

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```
