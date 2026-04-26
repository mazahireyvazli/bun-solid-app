import type { RouteDefinition, RouteSectionProps } from "@solidjs/router";

export namespace HomePageRoute {
  type Props = RouteSectionProps<
    Promise<{
      resolvedStyles: string[];
    }>
  >;

  type Definition = RouteDefinition<"/", Props["data"]>;
}
