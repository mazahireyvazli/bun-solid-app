# Imports — where things live in 2.0

The DOM/web runtime is its own package, and several `solid-js/*` subpath imports moved out.

```ts
// 1.x
import { render, hydrate } from "solid-js/web";
// 2.0
import { render, hydrate } from "@solidjs/web";
```

```ts
// 1.x
import { createStore } from "solid-js/store";
// 2.0 — store APIs are exported from solid-js directly
import { createStore, reconcile, snapshot, storePath } from "solid-js";
```

```ts
// 1.x
import h from "solid-js/h";
// 2.0
import h from "@solidjs/h";
```

```ts
// 1.x
import html from "solid-js/html";
// 2.0
import html from "@solidjs/html";
```

```ts
// 1.x
import { createRenderer } from "solid-js/universal";
// 2.0
import { createRenderer } from "@solidjs/universal";
```

## Quick map

- `solid-js/web` → `@solidjs/web`
- `solid-js/store` → `solid-js` (store APIs now top-level)
- `solid-js/h` → `@solidjs/h`
- `solid-js/html` → `@solidjs/html`
- `solid-js/universal` → `@solidjs/universal`
