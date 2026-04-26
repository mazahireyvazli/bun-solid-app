import { feature } from "bun:bundle";
import { type Component, lazy } from "solid-js";

/**
 * lazy in solid-js does not work properly under SSR
 * Very first server render: either lazy components are not rendered or Suspense/Loading boundary not displayed
 * If you are building an application with SSR, use ssrLazy instead of lazy
 * build/lazy.babel.plugin.ts has been adjusted to support this (see: LAZY_FN_NAME and LAZY_FN_SOURCE)
 */

export const ssrLazy = async <T extends Component<any>>(
  fn: () => Promise<{ default: T }>,
  moduleUrl?: string,
): Promise<ReturnType<typeof lazy<T>>> => {
  if (feature("SSR")) {
    const lz = lazy(fn, moduleUrl);
    return lz.preload().then(() => lz);
  }

  return lazy(fn, moduleUrl);
};
