export type GetUsersResponseJSON = {
  id: number;
  name: string;
}[];

export const serverFunctions = {
  get_users: async (_request: Request, response: Response) => {
    response.headers.set("Content-Type", "application/json");

    const data: GetUsersResponseJSON = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
      { id: 3, name: "Bob" },
    ];

    return Response.json(data, response);
  },
};
