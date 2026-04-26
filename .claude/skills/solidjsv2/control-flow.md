# Control flow

## `Index` is gone — use `<For keyed={false}>`

The `For` child function receives **accessors** for both the item and the index, so call them: `item()` / `i()`.

```jsx
// 1.x
<Index each={items()}>
  {(item, i) => <Row item={item()} index={i} />}
</Index>

// 2.0
<For each={items()} keyed={false}>
  {(item, i) => <Row item={item()} index={i()} />}
</For>
```

## Function children often receive accessors — call them

This isn't just `For`. `Show`, `Switch`/`Match` and friends pass **accessors** into function children:

```jsx
<Show when={user()} fallback={<Login />}>
  {u => <Profile user={u()} />}
</Show>

<Switch>
  <Match when={route() === "profile"}>{() => <Profile />}</Match>
</Switch>
```

## Dynamic components

`createDynamic(source, props)` is replaced by a `lazy`-style factory: `dynamic(source): Component<P>`. Returns a stable component whose identity is driven by a reactive (and optionally async) source — children, refs, and reactive props flow through normal JSX.

```jsx
// JSX wrapper still works (now delegates to dynamic() internally)
import { Dynamic } from "@solidjs/web";
<Dynamic component={isEditing() ? Editor : Viewer} value={value()} />;

// Factory form (preferred when you want a stable component reference)
import { dynamic } from "@solidjs/web";
const Active = dynamic(() => (isEditing() ? Editor : Viewer));
return <Active value={value()} />;
```

Async sources compose with `Loading` via the normal `NotReadyError` flow — no wrapper primitive or `await` in user code.

## `SuspenseList` → `Reveal`

Coordinates sibling `Loading` boundaries. A single `order` prop replaces 1.x's `revealOrder`/`tail`:

- `"sequential"` (default) — matches `revealOrder="forwards"`
- `"together"` — matches `revealOrder="together"`
- `"natural"` — **new in 2.0**, no in-group ordering

`collapsed` is a sequential-only flag (replaces `tail="collapsed"`); ignored under `"together"` / `"natural"`.

```jsx
// Default: sequential
<Reveal>
  <Loading fallback={<Skeleton />}><ProfileHeader /></Loading>
  <Loading fallback={<Skeleton />}><Posts /></Loading>
</Reveal>

// Reveal whole group at once
<Reveal order="together">
  <Loading fallback={<Skeleton />}><ProfileHeader /></Loading>
  <Loading fallback={<Skeleton />}><Posts /></Loading>
</Reveal>

// Nested natural group: each card reveals independently once parent releases the slot
<Reveal>
  <Loading fallback={<Skeleton />}><Header /></Loading>
  <Reveal order="natural">
    <Loading fallback={<CardSkel />}><Card id={1} /></Loading>
    <Loading fallback={<CardSkel />}><Card id={2} /></Loading>
  </Reveal>
</Reveal>
```

> Earlier 2.0 betas exposed a boolean `together` prop — that's been replaced by `order="together"`.
