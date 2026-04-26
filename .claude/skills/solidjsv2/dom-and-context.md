# DOM and context

## Attributes & events: closer to HTML

- Built-in attributes are treated as **attributes** (not magic property mapping) and are generally **lowercase**.
- Boolean attributes are presence/absence: `muted={true}` adds it, `muted={false}` removes it.
- `attr:` and `bool:` namespaces are removed (you typically don't need them).
- `oncapture:` is removed.

```jsx
<video muted={true} />
<video muted={false} />

// When the platform really wants a string attribute:
<some-element enabled="true" />
```

## Directives: `use:` → `ref` directive factories

```jsx
// 1.x
<button use:tooltip={{ content: "Save" }} />

// 2.0
<button ref={tooltip({ content: "Save" })} />
<button ref={[autofocus, tooltip({ content: "Save" })]} />
```

Two-phase factories are recommended (owned setup → unowned apply):

```js
function titleDirective(source) {
  // Setup phase (owned): create primitives/subscriptions here.
  // Avoid imperative DOM mutation at top level.
  let el;
  createEffect(source, (value) => {
    if (el) el.title = value;
  });

  // Apply phase (unowned): DOM writes happen here.
  // No new primitives should be created in this callback.
  return (nextEl) => {
    el = nextEl;
  };
}
```

## `classList` → `class` (object/array forms)

```jsx
// 1.x
<div class="card" classList={{ active: isActive(), disabled: isDisabled() }} />

// 2.0
<div class={["card", { active: isActive(), disabled: isDisabled() }]} />
```

## Context providers: `Context.Provider` → "context is the provider"

```jsx
// 1.x
const Theme = createContext("light");
<Theme.Provider value="dark">{props.children}</Theme.Provider>;

// 2.0
const Theme = createContext("light");
<Theme value="dark">{props.children}</Theme>;
```
