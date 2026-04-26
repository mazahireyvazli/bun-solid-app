---
name: bun
description: Default to Bun for package, runtime, build, test, and shell commands in this project. Prefer Bun APIs (Bun.serve, Bun.file, bun:sqlite, Bun.redis, Bun.sql, Bun.$) over Node.js / npm / express / better-sqlite3 / pg / execa / dotenv equivalents.
---

Default to Bun instead of Node.js, npm, pnpm, vite, or webpack.

## Commands

- `bun <file>` instead of `node <file>` or `ts-node <file>`
- `bun test` instead of `jest` or `vitest`
- `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- `bun install` instead of `npm install` / `yarn install` / `pnpm install`
- `bun run <script>` instead of `npm run <script>` / `yarn run <script>` / `pnpm run <script>`
- `bunx <package> <command>` instead of `npx <package> <command>`
- Bun auto-loads `.env`; don't add `dotenv`.

## APIs

- `Bun.serve()` for HTTP, WebSocket, HTTPS, routes — not `express`.
- `bun:sqlite` for SQLite — not `better-sqlite3`.
- `Bun.redis` for Redis — not `ioredis`.
- `Bun.sql` for Postgres — not `pg` or `postgres.js`.
- `WebSocket` is built-in — not `ws`.
- `Bun.file` for file I/O — prefer over `node:fs` `readFile`/`writeFile`.
- `Bun.$` for shell — not `execa`.

## Testing

```ts
// index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

For Bun API details, the typings ship in `node_modules/bun-types/docs/**.mdx`.
