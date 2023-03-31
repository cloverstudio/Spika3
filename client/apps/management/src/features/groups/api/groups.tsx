import api, { SuccessResponse, ErrorResponse } from "@/api";

type UserType = {
    id: number;
    displayName: string;
    avatarFileId: number;
};

type RoomType = {
    id: number;
    name: string;
};

type RoomListType = {
    list: RoomType[];
    count: number;
    limit: number;
};

const groupsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getGroups: build.query<SuccessResponse<RoomListType> | ErrorResponse, number>({
            query: (page) => `/management/groups?page=${page}`,
            providesTags: [{ type: "Groups", id: "LIST" }],
        }),
        getGroupById: build.query<SuccessResponse<{ group: RoomType }> | ErrorResponse, number>({
            query: (groupId) => `/management/groups/${groupId}`,
            providesTags: (res) =>
                res && res.status === "success" ? [{ type: "Groups", id: res.data.group.id }] : [],
        }),
        getGroupsByUserId: build.query<
            SuccessResponse<{ rooms: RoomType[] }> | ErrorResponse,
            number
        >({
            query: (userId) => {
                return `/management/users/${userId}/groups`;
            },
            providesTags: (res, _, args) =>
                res && res.status === "success"
                    ? [
                          {
                              type: "Groups",
                              id: `USER_LIST_${args}`,
                          },
                      ]
                    : [],
        }),
        removeUserFromGroup: build.mutation<
            SuccessResponse<{ removed: { roomId: number; userId: number } }> | ErrorResponse,
            { userId: number; groupId: number }
        >({
            query: ({ userId, groupId }) => {
                return { url: `/management/groups/${groupId}/${userId}`, method: "DELETE" };
            },
            invalidatesTags: (res, _, args) =>
                res && res.status === "success"
                    ? [
                          {
                              type: "Groups",
                              id: `USER_LIST_${args.userId}`,
                          },
                          {
                              type: "Groups",
                              id: args.groupId,
                          },
                          {
                              type: "Groups",
                              id: "LIST",
                          },
                      ]
                    : [],
        }),
        updateGroup: build.mutation<
            SuccessResponse<{ group: RoomType }> | ErrorResponse,
            { groupId: string; data: any }
        >({
            query: ({ groupId, data }) => {
                return { url: `/management/groups/${groupId}`, method: "PUT", data };
            },
            invalidatesTags: (res) =>
                res && res.status === "success"
                    ? [
                          { type: "Groups", id: "LIST" },
                          { type: "Groups", id: res.data.group.id },
                      ]
                    : [],
        }),
        deleteGroup: build.mutation<any, number>({
            query: (groupId) => {
                return { url: `/management/groups/${groupId}`, method: "DELETE" };
            },
            invalidatesTags: (res) => (res ? [{ type: "Groups", id: "LIST" }] : []),
        }),
    }),
    overrideExisting: true,
});

export const {
    useRemoveUserFromGroupMutation,
    useGetGroupsByUserIdQuery,
    useGetGroupsQuery,
    useDeleteGroupMutation,
    useUpdateGroupMutation,
    useGetGroupByIdQuery,
} = groupsApi;
export default groupsApi;
