import { feature } from "bun:bundle";
import { type Component, lazy } from "solid-js";

export const ssrLazy = <T extends Component<any>>(fn: () => Promise<{ default: T }>) => {
  if (feature("SSR")) {
    return lazy(fn)
      .preload()
      .then((module) => module.default);
  }

  return lazy(fn);
};
