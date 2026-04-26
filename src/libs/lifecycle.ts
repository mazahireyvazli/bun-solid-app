import { createSignal, getListener, onMount, sharedConfig } from "solid-js";
import { isServer } from "solid-js/web";

export const createIsMounted = () => {
  const [isMounted, setIsMounted] = createSignal(false);
  onMount(() => setIsMounted(true));

  return isMounted;
};

export const isHydrated = () => !isServer && (!sharedConfig.context || (!!getListener() && createIsMounted()()));
