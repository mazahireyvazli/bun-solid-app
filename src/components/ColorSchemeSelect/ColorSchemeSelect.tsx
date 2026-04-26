import { For, type VoidComponent } from "solid-js";

import { createSignalStorage } from "@/src/libs/signal.storage";

// icons
import darkLightModeSVG from "@/src/assets/svg/dark_light_mode.svg" with { type: "text" };
import darkModeSVG from "@/src/assets/svg/dark_mode.svg" with { type: "text" };
import lightModeSVG from "@/src/assets/svg/light_mode.svg" with { type: "text" };
import { LoadCSS } from "@/src/libs/LoadCSS";
//end

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

  let dropdownRef: HTMLDivElement;

  const currentIcon = () => {
    const opt = options.find((o) => o.value === colorScheme());
    return opt?.icon ?? options[2]!.icon;
  };

  const handleSelect = (value: ColorScheme) => {
    setColorScheme(value);
    dropdownRef?.hidePopover();
  };

  return (
    <div class="cs-select">
      <LoadCSS
        imports={import("@/src/components/ColorSchemeSelect/color-scheme-select.css?inline").then((m) => [m.default])}
      />

      <button class="cs-select__toggle" popovertarget="cs-dropdown" aria-label="Change color scheme">
        {currentIcon()()}
      </button>
      <div
        class="cs-select__dropdown"
        ref={(el) => (dropdownRef = el)}
        id="cs-dropdown"
        popover="auto"
        role="listbox"
        aria-label="Color scheme options"
      >
        <For each={options}>
          {(option) => (
            <button
              class="cs-select__option"
              classList={{ "cs-select__option--active": colorScheme() === option.value }}
              role="option"
              aria-selected={colorScheme() === option.value}
              onClick={() => handleSelect(option.value)}
            >
              {option.icon()}
              <span>{option.label}</span>
              <span class="cs-select__option-check">{colorScheme() === option.value ? "\u2713" : ""}</span>
            </button>
          )}
        </For>
      </div>
    </div>
  );
};
