---
name: solidjsv2
description: Write or migrate SolidJS code targeting Solid 2.0 beta. Use when the project depends on solid-js@^2 / @solidjs/web@^2, or when the user mentions Solid 2, Solid v2 migration, @solidjs/web, the Loading/Errored/Reveal primitives, split createEffect, action+optimistic stores, or other 2.0-only APIs.
---

# Solid 2.0 — migration & authoring guide

This skill is **progressive disclosure**: the checklist below is the only content you need loaded by default. When a task touches a specific area, **read just the relevant topic file** from this directory rather than absorbing the whole guide.

## What changed in 2.0 (read this; it covers most edits)

- **Imports**: DOM runtime moved to `@solidjs/web`; store APIs are now top-level on `solid-js`. Several other subpath imports moved to `@solidjs/*` packages.
- **Batching**: writes are batched by microtask. Setters don't immediately change what reads return — values become visible after the flush, or via `flush()`. `batch()` is gone.
- **Effects**: `createEffect` is split into compute → apply. Cleanup is "return a cleanup function" from apply. `createComputed` and the `on` helper are removed.
- **Lifecycle**: `onMount` → `onSettled` (can return cleanup).
- **Async UI**: `Suspense` → `Loading`. `ErrorBoundary` → `Errored`. `createResource` → async `createMemo` + `Loading`. Use `isPending(() => expr)` for "refreshing…" indicators (false during initial Loading).
- **Mutations**: `startTransition`/`useTransition` are gone. Use `action(...)` + `createOptimistic`/`createOptimisticStore` + `refresh(...)`.
- **Lists**: `Index` is gone — use `<For keyed={false}>`. `For` children receive accessors (`item()`, `i()`). `Show`/`Switch` function children also pass accessors.
- **Stores**: setters are draft-first by default (`produce` is gone — it's the default). `unwrap` → `snapshot`. `mergeProps` → `merge`, `splitProps` → `omit`. `createSignal(fn)` and `createStore(fn)` create writable derived primitives.
- **DOM**: `use:` directives → `ref` directive factories. `classList` → `class` (object/array forms). Attributes are lowercase and treated as attributes (not properties); `attr:`/`bool:`/`oncapture:` namespaces removed.
- **Context**: the context **is** the provider — `<MyContext value={...}>` (no `.Provider`).
- **Dev warnings**: top-level reactive reads in component bodies warn; writes inside reactive (owned) scope throw — derive with `createMemo` or write in event handlers.

## Topic files (read on demand)

| File                                     | When to load                                                                                                                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [imports.md](imports.md)                 | Editing import statements; debugging "module not found" after upgrade.                                                                                                      |
| [effects.md](effects.md)                 | Touching `createEffect` / `createMemo` / lifecycle / `flush` / `createComputed` / `on` / dev warnings.                                                                      |
| [async.md](async.md)                     | `Loading`, `Errored`, `createResource` migration, `isPending` / `latest` / `refresh`, `action`, optimistic stores.                                                          |
| [stores.md](stores.md)                   | `createStore`, draft setters, `snapshot`, `merge`/`omit`, function-form primitives, `createMutable` migration.                                                              |
| [control-flow.md](control-flow.md)       | `For`/`Index`, accessor-passing children, `Dynamic`/`dynamic`, `Reveal`/`SuspenseList`.                                                                                     |
| [dom-and-context.md](dom-and-context.md) | Attributes, `ref` directive factories, `classList` → `class`, `Context.Provider` → `<Context value>`.                                                                       |
| [new-apis.md](new-apis.md)               | Reaching for a 2.0-only primitive (`Reveal`, `Repeat`, `action`, `createOptimistic`, `dynamic`, `latest`, `refresh`, `resolve`, `deep`, `reconcile`, `EffectBundle`, etc.). |
| [rename-map.md](rename-map.md)           | Quick lookup: "what's the 2.0 equivalent of X?" Flat tables, no examples.                                                                                                   |

## How to use

1. Skim the checklist above to identify which topic(s) the current edit touches.
2. Read **only those** topic files. Most edits need one file.
3. For a quick rename lookup, use `rename-map.md` — it's flat and small.
4. If the user is doing a whole-file or whole-app migration, read multiple topic files as needed; you generally still won't need all of them.
