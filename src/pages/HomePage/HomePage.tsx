import { createAsync, query, type RouteSectionProps } from "@solidjs/router";
import { createSignal, Suspense } from "solid-js";

import type { GetUsersResponseJSON } from "@/server/serverfn";

import { callServerFn } from "@/src/libs/call_serverfn";

const getUsersQuery = query(
  () => callServerFn("get_users").then((r) => r.json() as Promise<GetUsersResponseJSON>),
  "getUsersQuery",
);

const getErrorQuery = query(() => callServerFn("get_error").then((r) => r.json()), "getErrorQuery");

export const HomePage = (props: RouteSectionProps) => {
  const [count, setCount] = createSignal(0);

  const users = createAsync(() => getUsersQuery());

  const error = createAsync(() => getErrorQuery());

  return (
    <>
      <div>Home Page {props.params?.id}</div>
      <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>

      <Suspense fallback={<div>Loading...</div>}>
        <pre>{JSON.stringify(users(), null, 2)}</pre>
      </Suspense>

      <button onClick={() => getErrorQuery()}>Get Error</button>
      <Suspense fallback={<div>Loading...</div>}>
        <pre>{JSON.stringify(error(), null, 2)}</pre>
      </Suspense>
    </>
  );
};

export default HomePage;
