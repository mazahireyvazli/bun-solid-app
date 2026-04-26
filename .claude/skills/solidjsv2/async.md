# Async data, transitions, and errors

## `Suspense` → `Loading`, `ErrorBoundary` → `Errored`

```jsx
// 1.x
<Suspense fallback={<Spinner />}><Profile /></Suspense>
<ErrorBoundary fallback={err => <p>{err.message}</p>}><Child /></ErrorBoundary>

// 2.0
<Loading fallback={<Spinner />}><Profile /></Loading>
<Errored fallback={err => <p>{err.message}</p>}><Child /></Errored>
```

Error boundaries heal automatically — `resetErrorBoundaries` is gone.

## `createResource` → async computations + `Loading`

Replace resources with async `createMemo` (or `createStore(fn)` for collections), and wrap consumers in `Loading`:

```js
// 1.x
const [user] = createResource(id, fetchUser);

// 2.0
const user = createMemo(() => fetchUser(id()));
```

```jsx
<Loading fallback={<Spinner />}>
  <Profile user={user()} />
</Loading>
```

Resource tuple features map to standalone APIs:

| 1.x feature        | 2.0 replacement                                                   |
| ------------------ | ----------------------------------------------------------------- |
| `resource.loading` | `Loading` (initial), `isPending(() => resource())` (revalidation) |
| `resource.error`   | `Errored` boundary, or effect `error` option                      |
| `refetch()`        | `refresh(resource)`                                               |
| `mutate()`         | `createOptimisticStore` + `action`                                |

## Initial loading vs revalidation

- **`Loading`** — initial "not ready" UI boundary.
- **`isPending(fn)`** — "stale while revalidating" check; **false during the initial Loading fallback**.

```jsx
const listPending = () => isPending(() => users() || posts());

<>
  <Show when={listPending()}>{/* "refreshing…" indicator */}</Show>
  <Loading fallback={<Spinner />}>
    <List users={users()} posts={posts()} />
  </Loading>
</>;
```

## Peeking in-flight values

```js
const latestId = () => latest(id);
```

## Refresh / refetch

```js
// After a server write, recompute a derived read
refresh(storeOrProjection);

// Or re-run a read tree
refresh(() => query.user(id()));
```

## Mutations: `action(...)` + optimistic helpers

`startTransition` and `useTransition` are gone. Use `action`, optimistic stores, and `refresh`:

```js
const [todos] = createStore(() => api.getTodos(), { list: [] });
const [optimisticTodos, setOptimisticTodos] = createOptimisticStore({ list: [] });

const addTodo = action(function* (todo) {
  // optimistic UI
  setOptimisticTodos((s) => s.list.push(todo));
  // server write
  yield api.addTodo(todo);
  // recompute reads derived from the source-of-truth
  refresh(todos);
});
```

## `onError` / `catchError` are removed

Component-level error UI → `Errored` (above). Programmatic effect error handling → `error` option on `createEffect`:

```js
createEffect(() => riskyAsyncWork(), {
  effect: (value) => {
    /* success */
  },
  error: (err) => console.error("caught:", err),
});
```

## External reactive sources: `from` / `observable` are removed

**External → Solid (`from`)**: async iterables work directly in computations:

```js
// 2.0
const value = createMemo(async function* () {
  for await (const val of observable$) yield val;
});
```

**Solid → External (`observable`)**: no drop-in replacement. Use an effect to push:

```js
createEffect(signal, (value) => {
  externalLib.update(value);
});
```

Building a standard Observable/AsyncIterable interface for external consumers needs a hand-rolled adapter — likely to land in `@solid-primitives` later.
