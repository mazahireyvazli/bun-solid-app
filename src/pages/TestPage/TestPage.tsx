import { createSignal, type Component } from "solid-js";

import type { TestPageRoute } from "@/src/pages/TestPage/types";

import spoilerAvif from "@/src/assets/images/spoiler.avif";

export const TestPage: Component<TestPageRoute.Props> = (props) => {
  const [text, setText] = createSignal("");

  return (
    <>
      <div>Test Page {props.params?.id}</div>
      <input type="text" onInput={(e) => setText(e.currentTarget.value)} />
      <button>Count: {text()}</button>
      <img src={spoilerAvif} alt="" />
    </>
  );
};

export default TestPage;
