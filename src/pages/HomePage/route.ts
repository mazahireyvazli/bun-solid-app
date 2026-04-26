import type { HomePageRoute } from "@/src/pages/HomePage/types";

import { ssrLazy } from "@/src/libs/ssr_lazy";

export const homePageRouteDefinition: HomePageRoute.Definition = {
  path: "/",
  component: await ssrLazy(() => import("@/src/pages/HomePage/HomePage")),
};
