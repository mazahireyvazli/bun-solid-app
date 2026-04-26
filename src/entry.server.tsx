import { generateHydrationScript, getAssets, renderToStream, useAssets } from "solid-js/web";
import { provideRequestEvent } from "solid-js/web/storage";

import { AppProvider } from "@/src/root";

// Color scheme script
import "@/src/assets/scripts/color_scheme";
// end

export default async function render(request: Request, response: Response) {
  return provideRequestEvent({ request, response }, async () => {
    const { readable, writable } = new TransformStream();

    const shellReady = Promise.withResolvers();

    renderToStream(() => <AppProvider url={request.url} />, {
      renderId: "main",
      async onCompleteShell() {
        useAssets(() => <></>);

        shellReady.resolve();
      },
    }).pipeTo(writable);

    return {
      body: readable,
      head: async () => {
        await shellReady.promise;
        return getAssets() + generateHydrationScript();
      },
    };
  });
}
