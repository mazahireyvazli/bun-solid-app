# Stores

## Draft-first setters (default)

`produce` is no longer needed — it's the default. Setters receive a mutable draft.

```js
// 1.x
import { produce } from "solid-js/store";
setStore(
  produce((s) => {
    s.user.name = "Alice";
    s.list.push("item");
  }),
);

// 2.0
setStore((s) => {
  s.user.name = "Alice";
  s.list.push("item");
});
```

If you need the old path-style ergonomics, opt in with `storePath`:

```js
setStore(storePath("user", "address", "city", "Paris"));
```

## `unwrap(store)` → `snapshot(store)`

```js
const plain = snapshot(store);
JSON.stringify(plain);
```

## `mergeProps` → `merge`, `splitProps` → `omit`

```js
// 1.x
const merged = mergeProps(defaults, overrides);
const [local, rest] = splitProps(props, ["class", "style"]);

// 2.0
const merged = merge(defaults, overrides);
const rest = omit(props, "class", "style");
```

**Gotcha**: `merge` treats `undefined` as a real value (it overrides), not "skip this key":

```js
const merged = merge({ a: 1, b: 2 }, { b: undefined });
// merged.b is undefined
```

## Function-form `createSignal(fn)` and `createStore(fn)`

`createSignal(fn)` creates a **writable derived signal**:

```js
const [count, setCount] = createSignal(0);
const [doubled] = createSignal(() => count() * 2);
```

`createStore(fn, seed)` creates a **derived store**:

```js
const [items] = createStore(() => api.listItems(), []);

const [cache] = createStore(
  (draft) => {
    draft.total = items().length;
  },
  { total: 0 },
);
```

## `createMutable` / `modifyMutable` are removed

Use `createStore` with draft setters. Writes now go through `setState`, which lets them participate in batching, transitions, and optimistic rollback (a direct-mutation proxy can't).

```js
// 1.x
const state = createMutable({ count: 0, items: [] });
state.count++;
state.items.push("a");

// 2.0
const [state, setState] = createStore({ count: 0, items: [] });
setState((s) => {
  s.count++;
  s.items.push("a");
});
```

## Misc renames

- `createSelector` → `createProjection` / `createStore(fn)`
- `equalFn` → `isEqual`
- `getListener` → `getObserver`
- `indexArray` → `mapArray` with `keyed: false`
- `writeSignal` → removed (was internal)
- `createDeferred` → removed; handle outside Solid
