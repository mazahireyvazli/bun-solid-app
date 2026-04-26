import { type BaseRouterProps, Router } from "@solidjs/router";
import { type VoidComponent } from "solid-js";

import { Link, Meta, MetaProvider, Title } from "@/src/libs/metahead";
// import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";

import { ColorSchemeSelect } from "@/src/components/ColorSchemeSelect/ColorSchemeSelect";
import { homePageRouteDefinition } from "@/src/pages/HomePage/route";
import { testPageRouteDefinition } from "@/src/pages/TestPage/route";
import { AuthProvider, useAuth } from "@/src/stores/auth.store";

export const RENDER_ID = "main";

const routes = [
  homePageRouteDefinition,
  testPageRouteDefinition,
  {
    path: "*",
    component: () => <>404 - Not found</>,
  },
] as BaseRouterProps["children"];

const RootLayout: BaseRouterProps["root"] = (props) => {
  const { auth } = useAuth();

  return (
    <>
      <header>
        <div class="header-content">
          <h1>Bun + Solid</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/test">Test</a>
          </nav>
          <ColorSchemeSelect />
          <div>
            <span>{auth().username}</span>
          </div>
        </div>
      </header>
      <main>{props.children}</main>
    </>
  );
};

export const RootApp: VoidComponent<{ url?: string }> = (props) => {
  return (
    <Router url={props.url} root={RootLayout}>
      {routes}
    </Router>
  );
};

export const AppProvider: VoidComponent<{ url?: string }> = (props) => {
  return (
    <AuthProvider>
      <MetaProvider>
        <Title>{process.env.PUBLIC_DEFAULT_TITLE}</Title>
        <Meta name="description" content="SolidJS SSR Starter with Vite, Hono and Bun" />
        <Link rel="icon" href="/favicon.ico" />

        <RootApp {...props} />
      </MetaProvider>
    </AuthProvider>
  );
};
