// Color scheme script
import "@/src/assets/scripts/color_scheme";
// end

import { generateHydrationScript, getAssets, renderToStream } from "@solidjs/web";
import { provideRequestEvent } from "@solidjs/web/storage";

import manifest from "@/out/client/manifest.json";
import { AppProvider, RENDER_ID } from "@/src/root";

export const render = async (request: Request, response: Response) => {
  return provideRequestEvent({ request, response, locals: {} }, async () => {
    const { origin } = new URL(request.url);

    const { readable, writable } = new TransformStream();

    void renderToStream(() => <AppProvider url={request.url} />, {
      renderId: RENDER_ID,
      manifest: { ...manifest, _base: `${origin}/` } as typeof manifest,
    }).pipeTo(writable);

    return {
      body: readable,
      head: async () => {
        return getAssets() + generateHydrationScript();
      },
    };
  });
};
