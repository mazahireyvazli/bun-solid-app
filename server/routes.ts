import type { Serve } from "bun";

import { compress } from "@/server/compress";
import { serverFunctions } from "@/server/serverfn";

export const routes = {
  "/_serverfn/:name": {
    POST(request) {
      const { name } = request.params;

      const serverFn = serverFunctions[name as keyof typeof serverFunctions];
      if (!serverFn) {
        return Response.json({ error: "function not found" }, { status: 404 });
      }

      return serverFn(request, new Response());
    },
  },

  "/chunks/*": {
    async GET(req) {
      const res = new Response();
      res.headers.set("Cache-Control", `public, max-age=${process.env.ASSETS_CACHE_MAX_AGE}, immutable`);

      const filePath = new URL(req.url).pathname;
      const file = Bun.file(`./out/client/${filePath}`);

      if (process.env.COMPRESSION === "ENABLED") {
        return compress(req, new Response(file, res));
      }

      return new Response(file, res);
    },
  },
  "/assets/*": {
    async GET(req) {
      const res = new Response();
      res.headers.set("Cache-Control", `public, max-age=${process.env.ASSETS_CACHE_MAX_AGE}, immutable`);

      const filePath = new URL(req.url).pathname;
      const file = Bun.file(`./out/client/${filePath}`);

      if (process.env.COMPRESSION === "ENABLED") {
        return compress(req, new Response(file, res));
      }

      return new Response(file, res);
    },
  },

  "/favicon.ico": Bun.file("./out/client/favicon.ico"),
  "/robots.txt": Bun.file("./out/client/robots.txt"),

  "/.well-known/*": {
    async GET(req) {
      const res = new Response();

      const filePath = new URL(req.url).pathname;
      const file = Bun.file(`./out/client/${filePath}`);

      if (!(await file.exists())) {
        return Response.json({ error: "file not found" }, { status: 404 });
      }

      return new Response(file, res);
    },
  },
} satisfies Serve.Options<undefined>["routes"];

export const streamHTML = ({
  beforeHead,
  beforeBody,
  afterBody,
  rendered,
}: {
  beforeHead: string | undefined;
  beforeBody: string | undefined;
  afterBody: string | undefined;
  rendered: {
    body: ReadableStream<any>;
    head: () => Promise<string>;
  };
}) => {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // 1. Send everything before app-body
      controller.enqueue(encoder.encode(beforeHead));
      const headContent = await rendered.head();
      controller.enqueue(encoder.encode(headContent));
      controller.enqueue(encoder.encode(beforeBody));

      // 2. Pipe the body stream
      const reader = rendered.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }

      // 3. Send closing tags
      controller.enqueue(encoder.encode(afterBody));
      controller.close();
    },
  });
};
