import { createSignal, For, type VoidComponent } from "solid-js";

import { createSignalStorage } from "@/src/libs/createSignalStorage";
import { ssrLazy } from "@/src/libs/ssr_lazy";

// icons
import darkLightModeSVG from "@/src/assets/svg/dark_light_mode.svg?inline";
import darkModeSVG from "@/src/assets/svg/dark_mode.svg?inline";
import lightModeSVG from "@/src/assets/svg/light_mode.svg?inline";
//end

const Styles = await ssrLazy(() => import("@/src/components/ColorSchemeSelect/css.tsx"));

const options: { value: ColorScheme; label: string; icon: () => ReturnType<VoidComponent> }[] = [
  {
    value: "light",
    label: "Light",
    icon: () => <span innerHTML={lightModeSVG} style={{ width: "16px", height: "16px" }} />,
  },
  {
    value: "dark",
    label: "Dark",
    icon: () => <span innerHTML={darkModeSVG} style={{ width: "16px", height: "16px" }} />,
  },
  {
    value: "default",
    label: "System",
    icon: () => <span innerHTML={darkLightModeSVG} style={{ width: "16px", height: "16px" }} />,
  },
];

export const ColorSchemeSelect: VoidComponent = () => {
  const [colorScheme, setColorScheme] = createSignalStorage<ColorScheme>(
    globalThis.colorScheme.storageKey,
    globalThis.colorScheme.initialValue,
  );

  const [currentIcon] = createSignal(() => {
    const opt = options.find((o) => o.value === colorScheme());

    if (!opt) {
      return options[2]!.icon();
    }

    return opt.icon();
  });

  const handleSelect = (value: ColorScheme) => {
    setColorScheme(value);
  };

  return (
    <div class="cs-select">
      <Styles />

      <button class="cs-select__toggle" popovertarget="cs-dropdown" aria-label="Change color scheme">
        {currentIcon()}
      </button>
      <div class="cs-select__dropdown" id="cs-dropdown" popover="auto" role="listbox" aria-label="Color scheme options">
        <For each={options}>
          {(option) => (
            <button
              class={{ "cs-select__option--active": colorScheme() === option().value, "cs-select__option": true }}
              role="option"
              aria-selected={(colorScheme() === option().value).toString() as "true" | "false"}
              onClick={() => handleSelect(option().value)}
              popovertarget="cs-dropdown"
              popovertargetaction="hide"
            >
              {option().icon()}
              <span>{option().label}</span>
              <span class="cs-select__option-check">{colorScheme() === option().value ? "\u2713" : ""}</span>
            </button>
          )}
        </For>
      </div>
    </div>
  );
};
