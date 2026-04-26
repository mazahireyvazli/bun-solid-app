# Effects, lifecycle, batching

## Batching: writes apply after the microtask flush

All writes are batched by default. Setters don't immediately change what reads return — the new value becomes visible after the microtask flush, or immediately via `flush()`.

```js
const [count, setCount] = createSignal(0);
setCount(1);
count(); // still 0
flush();
count(); // now 1
```

`batch()` from 1.x is gone — there's nothing to wrap. Use `flush()` only when you genuinely need synchronous "settled now" behavior (tests, imperative interop).

## Split effects: compute → apply

`createEffect` is split into two phases:

- **compute** — runs in the reactive tracking phase, returns a value
- **apply** — receives that value, performs side effects, can return cleanup

```js
// 1.x
createEffect(() => {
  el().title = name();
});

// 2.0
createEffect(
  () => name(),
  (value) => {
    el().title = value;
  },
);
```

The `initialValue` second arg from 1.x is gone. The compute function receives `prev` (undefined on first run); use a default parameter if you need a seed:

```js
// 1.x: createEffect(fn, 0)
// 2.0:
createEffect(
  (prev = 0) => count(),
  (value, prev) => {
    console.log("changed from", prev, "to", value);
  },
);
```

`createMemo` no longer takes an initialValue arg either — its second arg is `options`:

```js
// 1.x: createMemo(fn, 0)
// 2.0
const doubled = createMemo(() => count() * 2);
```

Cleanup lives on the apply side:

```js
createEffect(
  () => name(),
  (value) => {
    const id = setInterval(() => console.log(value), 1000);
    return () => clearInterval(id);
  },
);
```

## Lifecycle: `onMount` → `onSettled`

`onMount` is gone. The closest replacement is `onSettled`, which can also return cleanup.

```js
// 2.0
onSettled(() => {
  measureLayout();
  const onResize = () => measureLayout();
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
});
```

## `createComputed` is removed — pick a replacement based on intent

**Readonly derivation** — `createMemo`:

```js
const doubled = createMemo(() => count() * 2);
```

**Side effect on change** — split `createEffect`:

```js
createEffect(
  () => input(),
  (val) => localStorage.setItem("input", val),
);
```

**Derived-with-writeback** — function-form `createSignal`:

```js
const [value, setValue] = createSignal(() => props.initial);
```

## `on` helper is removed — split effects already declare deps

```js
// 1.x: createEffect(on(count, (v, p) => ...))
// 2.0
createEffect(
  () => count(),
  (value, prev) => {
    /* ... */
  },
);
```

`on`'s `defer: true` lives on `createEffect` directly:

```js
createEffect(
  count,
  (value) => {
    /* ... */
  },
  { defer: true },
);
```

## Dev warnings

**Top-level reactive read in a component** — reading reactive values at the top level of a component body (including destructuring props) warns. Move the read into JSX or a reactive scope:

```jsx
// ❌ warns
function Bad({ title }) {
  return <h1>{title}</h1>;
}
// ✅
function Ok(props) {
  return <h1>{props.title}</h1>;
}
```

**Write inside reactive scope (owned scope)** — writing to signals/stores inside a memo/effect compute throws in dev. Derive with `createMemo` instead, or write in event handlers / apply functions. If you really need it (internal signal), opt in with `ownedWrite: true`.

```js
// ❌ throws
createMemo(() => setDoubled(count() * 2));
// ✅
const doubled = createMemo(() => count() * 2);
```

## Effect error handling: `EffectBundle`

`createEffect` accepts `{ effect, error }` for structured error handling (replaces `catchError` for effect bodies):

```js
createEffect(() => riskyAsyncWork(), {
  effect: (value) => {
    /* success path */
  },
  error: (err) => console.error("caught:", err),
});
```

For component-level error UI see [async.md](async.md) (`Errored`).
