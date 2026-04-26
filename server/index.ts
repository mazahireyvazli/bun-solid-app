import { serve } from "bun";

import { routes, streamHTML } from "@/server/routes";
import render from "@/src/entry.server";

const templateFile = Bun.file(`./out/client/index.html`);
const template = await templateFile.text();
const [beforeHead, afterHead] = template.split("<!--app-head-->") || [];
const [beforeBody, afterBody] = afterHead?.split("<!--app-body-->") || [];

export const server = serve({
  routes,

  async fetch(_req) {
    const response = new Response();
    response.headers.set("Content-Type", "text/html");

    const rendered = await render(_req, response);

    const stream = streamHTML({
      beforeHead,
      beforeBody,
      afterBody,
      rendered,
    });

    return new Response(stream, response);
  },
  error(error) {
    return Response.json({ error: error.message }, { status: 500 });
  },

  development: false,

  port: 3003,
});

console.log(`Listening on ${server.url}`);
