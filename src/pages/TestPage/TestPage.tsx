import { query } from "@solidjs/router";
import { createMemo, createSignal, For, Loading, type Component } from "solid-js";

import type { GetUsersRequestBody, GetUsersResponseJSON } from "@/server/serverfn";
import type { TestPageRoute } from "@/src/pages/TestPage/types";

import spoilerAvif from "@/src/assets/images/spoiler.avif";
import { callServerFn } from "@/src/libs/call_serverfn";

// import { Title } from "@solidjs/meta";
import { Title } from "@/src/libs/metahead";

const getUsersQuery = query(
  (ids: number[]) =>
    callServerFn("get_users", JSON.stringify({ ids } as GetUsersRequestBody)).then(
      (r) => r.json() as Promise<GetUsersResponseJSON>,
    ),
  "getUsersQuery",
);

export const TestPage: Component<TestPageRoute.Props> = (_props) => {
  const [userId, setUserId] = createSignal(0);
  const users = createMemo(() => getUsersQuery(userId() ? [userId()] : [1, 3, 13]));

  return (
    <>
      <Title>Test page</Title>
      <div class="test-section">
        <h2>Text Input Demo</h2>
        <p>Type id of user you want to see</p>
        <div class="input-group">
          <input
            type="number"
            placeholder="Type something..."
            onInput={(e) => setUserId(Number(e.currentTarget.value))}
          />
        </div>
      </div>

      <div class="users-section">
        <h2>Sample Users</h2>
        <Loading>
          <For each={users()}>
            {(user) => (
              <div class="user-card">
                <span class="user-id">{user().id}</span>
                <span>{user().name}</span>
              </div>
            )}
          </For>
        </Loading>
      </div>

      <div class="image-section">
        <h2>Sample Image</h2>
        <img src={spoilerAvif} alt="Sample image" width="200" />
      </div>
    </>
  );
};

export default TestPage;
