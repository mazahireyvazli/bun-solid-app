import { createSignal, type Component } from "solid-js";

import type { HomePageRoute } from "@/src/pages/HomePage/types";

export const HomePage: Component<HomePageRoute.Props> = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div class="counter-section">
      <h2>Interactive Counter</h2>
      <p>Click the button to increment the counter.</p>
      <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>
    </div>
  );
};

export default HomePage;
