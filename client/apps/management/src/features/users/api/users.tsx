import api, { SuccessResponse, ErrorResponse } from "@/api";

type UserType = {
    id: number;
    displayName: string;
    avatarFileId: number;
};

type RoomsType = {
    id: number;
    name: string;
};

type UserListType = {
    list: UserType[];
    count: number;
    limit: number;
};

const usersApi = api.injectEndpoints({
    endpoints: (build) => ({
        getUsers: build.query<SuccessResponse<UserListType> | ErrorResponse, number>({
            query: (page) => `/management/users?page=${page}`,
            providesTags: [{ type: "Users", id: "LIST" }],
        }),
        getUserById: build.query<SuccessResponse<{ user: UserType }> | ErrorResponse, string>({
            query: (userId) => {
                return `/management/users/${userId}`;
            },
            providesTags: (res) =>
                res && res.status === "success" ? [{ type: "Users", id: res.data.user.id }] : [],
        }),
        getUserGroups: build.query<SuccessResponse<{ rooms: RoomsType[] }> | ErrorResponse, string>(
            {
                query: (userId) => {
                    return `/management/users/${userId}/groups`;
                },
            }
        ),
        updateUser: build.mutation<
            SuccessResponse<{ user: UserType }> | ErrorResponse,
            { userId: string; data: any }
        >({
            query: ({ userId, data }) => {
                return { url: `/management/users/${userId}`, method: "PUT", data };
            },
            invalidatesTags: (res) =>
                res && res.status === "success"
                    ? [
                          { type: "Users", id: "LIST" },
                          { type: "Users", id: res.data.user.id },
                      ]
                    : [],
        }),
        deleteUser: build.mutation<any, number>({
            query: (userId) => {
                return { url: `/management/users/${userId}`, method: "DELETE" };
            },
            invalidatesTags: (res) => (res ? [{ type: "Users", id: "LIST" }] : []),
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useGetUserGroupsQuery,
} = usersApi;
export default usersApi;
