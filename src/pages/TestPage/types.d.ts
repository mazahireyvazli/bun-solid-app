import type { RouteDefinition, RouteSectionProps } from "@solidjs/router";

export namespace TestPageRoute {
  type Props = RouteSectionProps;

  type Definition = RouteDefinition<"/test", Props["data"]>;
}
