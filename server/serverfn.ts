export type GetAuthResponseJSON = {
  username: string;
};

export type GetUsersResponseJSON = {
  id: number;
  name: string;
}[];

export type GetUsersRequestBody = {
  ids: number[];
};

const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 3, name: "Bob" },
];

export const serverFunctions = {
  get_auth: async (_request: Request, _response: Response) => {
    // read request details (cookies/headers/params) and return authentication response

    return Response.json({
      username: "mike",
    });
  },
  get_users: async (request: Request, response: Response) => {
    const { ids } = (await request.json()) as GetUsersRequestBody;

    const data: GetUsersResponseJSON = users.filter((user) => ids.includes(user.id));

    return Response.json(data, response);
  },
  get_error: async () => {
    throw new Error("Something went wrong. Custom error...");
  },
};
