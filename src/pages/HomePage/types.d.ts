import type { RouteDefinition, RouteSectionProps } from "@solidjs/router";

export namespace HomePageRoute {
  type Props = RouteSectionProps;

  type Definition = RouteDefinition<"/", Props["data"]>;
}
