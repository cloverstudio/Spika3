import api from "./api";
import UserType, { UserListType } from "../types/User";

const userApi = api.injectEndpoints({
    endpoints: (build) => ({
        getUsers: build.query<UserListType, number>({
            query: (page) => `/management/user?page=${page}`,
            providesTags: [{ type: "User", id: "LIST" }],
        }),
        createUser: build.mutation<{ user: UserType }, any>({
            query: (data) => {
                return { url: "/management/user", data, method: "POST" };
            },
            invalidatesTags: (res) => res && [{ type: "User", id: "LIST" }],
        }),
        getUserById: build.query<{ user: UserType }, string>({
            query: (userId) => {
                return `/management/user/${userId}`;
            },
        }),
        updateUser: build.mutation<{ user: UserType }, { userId: string; data: any }>({
            query: ({ userId, data }) => {
                return { url: `/management/user/${userId}`, method: "PUT", data };
            },
            invalidatesTags: (res) => res && [{ type: "User", id: "LIST" }],
        }),
        deleteUser: build.mutation<{ userId: string }, any>({
            query: (userId) => {
                return { url: `/management/user/${userId}`, method: "DELETE" };
            },
            invalidatesTags: (res) => res && [{ type: "User", id: "LIST" }],
        }),

        getUsersBySearchTerm: build.query<UserListType, string>({
            query: (searchTerm) => `/management/user/search?searchTerm=${searchTerm}`,
            providesTags: [{ type: "User", id: "LIST" }],
        }),

        getVerifiedUsers: build.query<UserListType, number>({
            query: (page) => `/management/user/verified?page=${page}`,
            providesTags: [{ type: "User", id: "LIST" }],
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
    useGetUsersBySearchTermQuery,
    useGetVerifiedUsersQuery,
} = userApi;
export default userApi;
