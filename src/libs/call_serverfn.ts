import { feature } from "bun:bundle";
import { getRequestEvent } from "solid-js/web";

import type { serverFunctions } from "@/server/serverfn";

export const callServerFn = async (name: keyof typeof serverFunctions) => {
  if (feature("SSR")) {
    const { request } = getRequestEvent()!;

    const { serverFunctions } = await import("@/server/serverfn");

    const serverFn = serverFunctions[name];
    if (!serverFn) {
      return Response.json({ error: "function not found" }, { status: 404 });
    }

    return serverFn(request, new Response());
  }

  return fetch(`/_serverfn/${name}`);
};
