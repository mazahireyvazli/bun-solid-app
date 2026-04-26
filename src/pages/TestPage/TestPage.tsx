import { createSignal, type Component } from "solid-js";

import type { TestPageRoute } from "@/src/pages/TestPage/types";

import spoilerAvif from "@/src/assets/images/spoiler.avif";
import { LoadCSS } from "@/src/libs/LoadCSS";

export const TestPage: Component<TestPageRoute.Props> = (props) => {
  const [text, setText] = createSignal("");

  return (
    <>
      <LoadCSS imports={props.data.then((data) => data.resolvedStyles)} />

      <div>Test Page {props.params?.id}</div>
      <input type="text" onInput={(e) => setText(e.currentTarget.value)} />
      <button>Count: {text()}</button>
      <img src={spoilerAvif} alt="" />
    </>
  );
};

export default TestPage;
