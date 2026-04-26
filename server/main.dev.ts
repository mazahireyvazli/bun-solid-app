import { serve } from "bun";

import { routes, streamHTML } from "@/server/routes.js";
import { render } from "@/src/entry.server";

export const server = serve({
  routes,

  async fetch(req) {
    try {
      const response = new Response();
      response.headers.set("Content-Type", "text/html");

      const templateFile = Bun.file(`./out/client/index.html`);
      const template = await templateFile.text();
      const [beforeHead, afterHead] = template.split("<!--app-head-->") || [];
      const [beforeBody, afterBody] = afterHead?.split("<!--app-body-->") || [];

      const rendered = await render(req, response);

      const stream = streamHTML({
        beforeHead,
        beforeBody,
        afterBody,
        rendered,
      });

      return new Response(stream, response);
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }

      throw error;
    }
  },

  development: true,

  port: process.env.PORT,
});

console.log(`Listening on ${server.url}`);
