# my-solid-app

SolidJS SSR app built and served by [Bun](https://bun.com).

## Requirements

- [Bun](https://bun.com) v1.3+

## Install

```bash
bun install
```

## Run

Development (hot-reload server + watcher rebuilding bundles on change):

```bash
make dev
```

Production build and serve:

```bash
make start
```

The server listens on http://localhost:3003.

## Other commands

- `make build` — minified SSR + client build into `out/`
- `make build-dev` — same as `build` with `--no-minify`
