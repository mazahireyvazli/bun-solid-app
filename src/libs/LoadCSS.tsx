import { createAsync } from "@solidjs/router";
import { Suspense, type VoidComponent } from "solid-js";

export const LoadCSS: VoidComponent<{
  imports: Promise<string[]>;
}> = ({ imports }) => {
  const css = createAsync(
    async () => {
      return imports;
    },
    {
      deferStream: true,
    },
  );

  return (
    <Suspense>
      {css()?.map((c) => (
        <style textContent={c} />
      ))}
    </Suspense>
  );
};
