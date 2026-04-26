# Quick rename / removal map

Flat lookup. For migration details, see the topic-specific files.

## Import paths

- `solid-js/web` → `@solidjs/web`
- `solid-js/store` → `solid-js` (store APIs now top-level)
- `solid-js/h` → `@solidjs/h`
- `solid-js/html` → `@solidjs/html`
- `solid-js/universal` → `@solidjs/universal`

## Renames

- `Suspense` → `Loading`
- `SuspenseList` → `Reveal`
- `ErrorBoundary` → `Errored`
- `mergeProps` → `merge`
- `splitProps` → `omit`
- `createSelector` → `createProjection` / `createStore(fn)`
- `createDynamic(source, props)` → `dynamic(source)` factory (`<Dynamic>` JSX wrapper unchanged)
- `unwrap` → `snapshot`
- `onMount` → `onSettled`
- `equalFn` → `isEqual`
- `getListener` → `getObserver`
- `classList` → `class` (object/array forms)

## Removals

- `createResource` → async computations + `Loading` ([async.md](async.md))
- `startTransition` / `useTransition` → built-in transitions + `isPending`/`Loading` + optimistic APIs
- `batch` → `flush()` only when synchronous application is needed ([effects.md](effects.md))
- `createComputed` → `createEffect` (split), function-form `createSignal`/`createStore`, or `createMemo` ([effects.md](effects.md))
- `on` helper → no longer necessary with split effects
- `onError` / `catchError` → `Errored` or effect `error` option
- `produce` → now the default store setter behavior (draft-first)
- `createMutable` / `modifyMutable` → `createStore` with draft setters
- `from` / `observable` → async iterators or push-effect adapter
- `createDeferred` → removed; handle outside Solid
- `indexArray` → `mapArray` with `keyed: false`
- `resetErrorBoundaries` → unnecessary (boundaries heal automatically)
- `enableScheduling` → removed
- `writeSignal` → removed (was internal)
- `use:` directives → `ref` directive factories
- `attr:` / `bool:` namespaces → standard attribute behavior
- `oncapture:` → removed
- `Context.Provider` → `<Context value={...}>` (the context is the provider)
