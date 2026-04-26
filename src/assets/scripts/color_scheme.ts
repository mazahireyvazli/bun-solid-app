globalThis.colorScheme = {
  storageKey: "colorScheme",
  initialValue: "default",
  mql: () => {
    if (typeof window === "undefined") {
      return;
    }

    return window.matchMedia("(prefers-color-scheme: dark)");
  },
  getPreferred: () => (colorScheme.mql()?.matches ? "dark" : "light"),
  getCalculated: () => {
    if (typeof window === "undefined") {
      return colorScheme.initialValue;
    }

    const themeFromStorage = window.localStorage.getItem(colorScheme.storageKey);
    if (themeFromStorage === null) {
      return colorScheme.getPreferred();
    }
    const parsedTheme = JSON.parse(themeFromStorage);
    if (parsedTheme === "default") {
      return colorScheme.getPreferred();
    }

    return parsedTheme;
  },
  apply: (value) => {
    if (typeof window === "undefined") {
      return;
    }

    window.document.documentElement.setAttribute("data-theme", value);
  },
  initListeners: () => {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("storage", (event) => {
      if (event.key === colorScheme.storageKey) {
        colorScheme.apply(colorScheme.getCalculated());
      }
    });

    colorScheme.mql()?.addEventListener("change", () => {
      colorScheme.apply(colorScheme.getCalculated());
    });
  },
};

colorScheme.apply(colorScheme.getCalculated());
colorScheme.initListeners();
