import { isServer } from "@solidjs/web";
import { createSignal, getObserver, onSettled, sharedConfig } from "solid-js";

export const createIsMounted = () => {
  const [isMounted, setIsMounted] = createSignal(false);
  onSettled(() => {
    setIsMounted(true);
  });

  return isMounted;
};

export const isHydrated = () => {
  return !isServer && (sharedConfig.registry?.size !== 0 || (!!getObserver() && createIsMounted()()));
};
