import api from "./api";
import UserType, { UserListType } from "../types/User";

const userApi = api.injectEndpoints({
    endpoints: (build) => ({
        getUsers: build.query<UserListType, number>({
            query: (page) => `/management/user?page=${page}`,
            providesTags: [{ type: "User", id: "LIST" }],
        }),
        createUser: build.mutation<{ room: UserType }, any>({
            query: (data) => {
                return { url: "/management/user", data, method: "POST" };
            },
        }),
        getUserById: build.query<{ user: UserType }, string>({
            query: (userId) => {
                return `/management/user/${userId}`;
            },
        }),
        updateUser: build.mutation<{ room: UserType }, { userId: string; data: any }>({
            query: ({ userId, data }) => {
                return { url: `/management/user/${userId}`, method: "PUT", data };
            },
            invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.userId }],
        }),
        deleteUser: build.mutation<{ userId: string }, any>({
            query: (userId) => {
                return { url: `/management/user/${userId}`, method: "DELETE" };
            },
            invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.userId }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetUsersQuery,
    useCreateUserMutation,
    useGetUserByIdQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = userApi;
export default userApi;
