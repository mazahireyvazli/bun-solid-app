# build
FROM oven/bun:1.3.13-alpine AS builder
WORKDIR /usr/src/app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN bun ./build/build.ts --target=browser --entrypoints=./src/index.html --outdir=./out/client
RUN bun ./build/build.ts --target=bun --entrypoints=./server/main.ts --outdir=./out/server --ssr

# Run the app
FROM oven/bun:1.3.13-alpine AS runner
WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY --from=builder /usr/src/app/out ./out

CMD ["bun", "./out/server/main.js"]
