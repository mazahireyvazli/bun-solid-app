import { type Accessor, createSignal, onCleanup, type Setter } from "solid-js";
import { isServer } from "solid-js/web";

import { isHydrated } from "@/src/libs/lifecycle";

export const createSignalStorage = <T>(key: string, initialValue: T) => {
  const [value, mutate] = createSignal(initialValue);
  const refetch = () => {
    if (isServer) {
      return initialValue;
    }

    const storedValue = globalThis.localStorage.getItem(key);
    if (storedValue === null) {
      return initialValue;
    }

    return JSON.parse(storedValue) as T;
  };

  const setValue = (value: T) => {
    const oldValue = globalThis.localStorage.getItem(key);
    const newValue = JSON.stringify(value);

    globalThis.localStorage.setItem(key, newValue);
    globalThis.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue,
        oldValue,
        storageArea: globalThis.localStorage,
        url: globalThis.location.href,
      }),
    );
  };

  const getValue = () => {
    if (!isHydrated()) {
      return refetch();
    }

    return value();
  };

  function onStorageHandler(event: StorageEvent) {
    if (event.key === key) {
      mutate(() => JSON.parse(event.newValue!));
    }
  }

  if (!isServer) {
    mutate(() => refetch());

    window.addEventListener("storage", onStorageHandler);
    onCleanup(() => {
      window.removeEventListener("storage", onStorageHandler);
    });
  }

  return [getValue, setValue] as [Accessor<T>, Setter<T>];
};
