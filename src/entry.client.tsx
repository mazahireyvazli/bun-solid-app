import { hydrate } from "@solidjs/web";

import { AppProvider, RENDER_ID } from "@/src/root";

hydrate(() => <AppProvider url={window.location.href} />, document.body, {
  renderId: RENDER_ID,
});
