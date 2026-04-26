import type { RouteDefinition, RouteSectionProps } from "@solidjs/router";

export namespace TestPageRoute {
  type Props = RouteSectionProps<
    Promise<{
      resolvedStyles: string[];
    }>
  >;

  type Definition = RouteDefinition<"/test", Props["data"]>;
}
