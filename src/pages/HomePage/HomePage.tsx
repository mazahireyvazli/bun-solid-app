import { createAsync, query, type RouteSectionProps } from "@solidjs/router";
import { createSignal, Suspense } from "solid-js";

import type { GetUsersResponseJSON } from "@/server/serverfn";

import { callServerFn } from "@/src/libs/call_serverfn";

const getUsersQuery = query(
  () => callServerFn("get_users").then((r) => r.json() as Promise<GetUsersResponseJSON>),
  "getUsersQuery",
);

export const HomePage = (props: RouteSectionProps) => {
  const [count, setCount] = createSignal(0);

  const users = createAsync(() => getUsersQuery());

  return (
    <>
      <div>Home Page {props.params?.id}</div>
      <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>

      <Suspense fallback={<div>Loading...</div>}>
        <pre>{JSON.stringify(users(), null, 2)}</pre>
      </Suspense>
    </>
  );
};

export default HomePage;
