import type { TestPageRoute } from "@/src/pages/TestPage/types";

import { ssrLazy } from "@/src/libs/ssr_lazy";

export const testPageRouteDefinition: TestPageRoute.Definition = {
  path: "/test",
  preload: async () => {
    const testPageCSS = await import("@/src/pages/TestPage/test.page.css?inline").then((m) => m.default);

    return {
      resolvedStyles: [testPageCSS],
    };
  },
  component: await ssrLazy(() => import("@/src/pages/TestPage/TestPage")),
};
