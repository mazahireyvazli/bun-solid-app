import type { HomePageRoute } from "@/src/pages/HomePage/types";

import { ssrLazy } from "@/src/libs/ssr_lazy";

const HomePage = await ssrLazy(() => import("@/src/pages/HomePage/HomePage"));
const Styles = await ssrLazy(() => import("@/src/pages/HomePage/styles"));

export const homePageRouteDefinition: HomePageRoute.Definition = {
  path: "/",
  preload: async () => {
    void HomePage.preload();
    void Styles.preload();
  },
  component: (props: HomePageRoute.Props) => {
    return (
      <>
        <Styles />
        <HomePage {...props} />
      </>
    );
  },
};
