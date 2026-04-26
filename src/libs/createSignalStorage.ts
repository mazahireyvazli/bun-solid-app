import { createSignal, onSettled, type Accessor, type Setter } from "solid-js";

export const createSignalStorage = <T>(key: string, initialValue: T) => {
  const [value, mutate] = createSignal<T>(() => initialValue);

  const fetchValue = () => {
    const storedValue = globalThis.localStorage.getItem(key);
    if (storedValue === null) {
      return initialValue;
    }

    return JSON.parse(storedValue) as T;
  };
  const storeValue = (value: T) => {
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

  onSettled(() => {
    mutate(fetchValue);

    function onStorageHandler(event: StorageEvent) {
      if (event.key === key) {
        mutate(() => JSON.parse(event.newValue!));
      }
    }

    window.addEventListener("storage", onStorageHandler);
    return () => {
      window.removeEventListener("storage", onStorageHandler);
    };
  });

  return [value, storeValue] as [Accessor<T>, Setter<T>];
};
