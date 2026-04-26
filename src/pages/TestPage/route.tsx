import type { TestPageRoute } from "@/src/pages/TestPage/types";

import { ssrLazy } from "@/src/libs/ssr_lazy";

const Styles = await ssrLazy(async () => {
  const testPageCSS = await import("@/src/pages/TestPage/test.page.css?inline").then((m) => m.default);

  return {
    default: () => <style textContent={testPageCSS} />,
  };
});

const TestPage = await ssrLazy(() => import("@/src/pages/TestPage/TestPage"));

export const testPageRouteDefinition: TestPageRoute.Definition = {
  path: "/test",
  preload: () => {
    void import("@/src/pages/TestPage/test.page.css?inline");
    void import("@/src/pages/TestPage/TestPage");
  },
  component: (props) => {
    return (
      <>
        <Styles />
        <TestPage {...props} />
      </>
    );
  },
};
