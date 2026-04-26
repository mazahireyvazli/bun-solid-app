import type { HomePageRoute } from "@/src/pages/HomePage/types";

import { ssrLazy } from "@/src/libs/ssr_lazy";

const Styles = await ssrLazy(async () => {
  const testPageCSS = await import("@/src/pages/HomePage/homepage.css?inline").then((m) => m.default);

  return {
    default: () => <style textContent={testPageCSS} />,
  };
});

const HomePage = await ssrLazy(() => import("@/src/pages/HomePage/HomePage"));

export const homePageRouteDefinition: HomePageRoute.Definition = {
  path: "/",
  preload: () => {
    void import("@/src/pages/HomePage/homepage.css?inline");
    void import("@/src/pages/HomePage/HomePage");
  },
  component: (props) => {
    return (
      <>
        <Styles />
        <HomePage {...props} />
      </>
    );
  },
};
