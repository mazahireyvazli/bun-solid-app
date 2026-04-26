import { hydrate } from "solid-js/web";

import { AppProvider } from "@/src/root";

hydrate(() => <AppProvider />, document.body, {
  renderId: "main",
});
