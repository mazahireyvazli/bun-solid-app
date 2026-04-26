import { createContext, createMemo, useContext, type Accessor, type ParentComponent } from "solid-js";

import type { GetAuthResponseJSON } from "@/server/serverfn";

import { callServerFn } from "@/src/libs/call_serverfn";

type AuthCtx = {
  auth: Accessor<GetAuthResponseJSON>;
};

const AuthContext = createContext<AuthCtx>();

export const useAuth = () => {
  const authCtx = useContext(AuthContext);
  if (!authCtx) {
    throw new Error("useAuth must be used within AuthStoreProvider");
  }
  return authCtx;
};

export const AuthProvider: ParentComponent = (props) => {
  const auth = createMemo(async () => {
    const r = await callServerFn("get_auth");
    return r.json() as Promise<GetAuthResponseJSON>;
  });

  return (
    <AuthContext
      value={{
        auth,
      }}
    >
      {props.children}
    </AuthContext>
  );
};
