import { getRequestEvent } from "@solidjs/web";
import { feature } from "bun:bundle";

import type { serverFunctions } from "@/server/serverfn";

export const callServerFn = async (name: keyof typeof serverFunctions, requestBody?: RequestInit["body"]) => {
  if (feature("SSR")) {
    const request = new Request(getRequestEvent()!.request, {
      method: "POST",
      body: requestBody,
    });

    const { serverFunctions } = await import("@/server/serverfn");

    const serverFn = serverFunctions[name];
    if (!serverFn) {
      return Response.json({ error: "function not found" }, { status: 404 });
    }

    return serverFn(request, new Response());
  }

  return fetch(`/_serverfn/${name}`, {
    method: "POST",
    body: requestBody,
  });
};
