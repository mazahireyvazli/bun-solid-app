import type { TestPageRoute } from "@/src/pages/TestPage/types";

import { ssrLazy } from "@/src/libs/ssr_lazy";

const TestPage = await ssrLazy(() => import("@/src/pages/TestPage/TestPage"));
const Styles = await ssrLazy(() => import("@/src/pages/TestPage/styles"));

export const testPageRouteDefinition: TestPageRoute.Definition = {
  path: "/test",
  preload: async () => {
    void TestPage.preload();
    void Styles.preload();
  },
  component: (props: TestPageRoute.Props) => {
    return (
      <>
        <Styles />
        <TestPage {...props} />
      </>
    );
  },
};
