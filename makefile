build:
	NODE_ENV=production bun run build --target=browser --entrypoints=./index.html --outdir=./out/client
	NODE_ENV=production bun run build --ssr --target=bun --entrypoints=./server/index.ts --outdir=./out/server

start: build
	NODE_ENV=production bun run ./out/server/index.js

build-dev:
	bun run build --target=browser --entrypoints=./index.html --outdir=./out/client --no-minify --features=IS_DEV
	bun run build --ssr --target=bun --entrypoints=./server/index.dev.ts --outdir=./out/server --no-minify --features=IS_DEV

dev: build-dev
	bun --watch run ./out/server/index.dev.js &
	bun run watch

fix:
	bunx oxfmt
	bunx oxlint --type-aware --type-check --fix --fix-suggestions
