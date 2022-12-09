import api from "../../../api/api";
import UserType from "../../../types/User";

const userApi = api.injectEndpoints({
    endpoints: (build) => ({
        getUserById: build.query<{ user: UserType }, number>({
            query: (userId) => {
                return `/messenger/users/${userId}`;
            },
        }),
        getBlockedUsers: build.query<UserType[], void>({
            query: () => {
                return `/messenger/blocks`;
            },
            transformResponse: (res) => res.blockedUsers,
            providesTags: [{ type: "BlockList" }],
        }),
        removeUserFromBlockList: build.mutation<void, number>({
            query: (userId) => {
                return { method: "DELETE", url: `/messenger/blocks/userId/${userId}` };
            },
            invalidatesTags: [{ type: "BlockList" }],
        }),
        removeBlockById: build.mutation<void, number>({
            query: (id) => {
                return { method: "DELETE", url: `/messenger/blocks/${id}` };
            },
            invalidatesTags: [{ type: "BlockList" }],
        }),
        blockUser: build.mutation<void, number>({
            query: (blockedId) => {
                return { method: "POST", url: `/messenger/blocks`, data: { blockedId } };
            },
            invalidatesTags: [{ type: "BlockList" }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetUserByIdQuery,
    useGetBlockedUsersQuery,
    useRemoveUserFromBlockListMutation,
    useBlockUserMutation,
    useRemoveBlockByIdMutation,
} = userApi;
export default userApi;
