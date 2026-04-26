# New APIs in 2.0

These are additions, not renames. For migration of existing 1.x code see the topic-specific files; this is a quick reference for 2.0-only primitives.

## Control flow

- **`Reveal`** — coordinates reveal timing of sibling `Loading` boundaries via `order` (`"sequential"` | `"together"` | `"natural"`) plus a sequential-only `collapsed` flag. Replaces `SuspenseList`.
- **`Repeat`** — count/range-based list rendering without diffing (skeletons, windowing).
- **`dynamic(source)`** — `lazy`-style factory returning a stable component whose identity is driven by a reactive (and optionally async) source. Backs the `<Dynamic>` JSX wrapper.

## Async & transitions

- **`action(fn)`** — wraps generator/async-generator mutations with transition coordination.
- **`createOptimistic` / `createOptimisticStore`** — signal/store primitives whose writes revert when a transition completes.
- **`isPending(fn)`** — expression-level "stale while revalidating" check.
- **`isRefreshing()`** — `true` when code is executing inside a `refresh()` cycle.
- **`latest(fn)`** — peek at in-flight values during transitions.
- **`refresh(target)`** — explicit recomputation/invalidation of derived reads.
- **`resolve(fn)`** — returns a Promise that resolves when a reactive expression settles.
- **`Loading` `on` prop** — controls when a Loading boundary re-shows fallback during revalidation.

## Stores & reactivity

- **`createProjection(fn, seed)`** — derived store with reactive reconciliation.
- **`deep(store)`** — deep observation of a store (tracks all nested changes).
- **`reconcile(value, key)`** — diffing function for updating stores from new data.
- **Function-form `createSignal(fn)` / `createStore(fn)`** — derived (writable) primitives.
- **`unobserved` callback** — fires when a signal/memo loses all subscribers (resource cleanup hook).

## Effects

- **`EffectBundle`** — `createEffect` accepts `{ effect, error }` for structured error handling.
- **`createMemo` `lazy` option** — defers initial computation until first read.
