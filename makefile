.PHONY: clean build start dev fix

clean:
	rm -rf out

build:
	NODE_ENV=production bun ./build/build.ts --target=browser --entrypoints=./src/index.html --outdir=./out/client
	NODE_ENV=production bun ./build/build.ts --target=bun --entrypoints=./server/main.ts --outdir=./out/server --ssr

start: clean build
	NODE_ENV=production bun ./out/server/main.js

build-dev:
	bun ./build/build.ts --target=browser --entrypoints=./src/index.html --outdir=./out/client --no-minify --features=IS_DEV
	bun ./build/build.ts --target=bun --entrypoints=./server/main.dev.ts --outdir=./out/server --no-minify --features=IS_DEV --ssr 

dev: clean build-dev
	bun --watch run ./out/server/main.dev.js &
	bun ./build/watch.ts

fix:
	bunx oxfmt
	bunx oxlint --type-aware --type-check --fix --fix-suggestions
