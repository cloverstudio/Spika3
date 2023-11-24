import api, { SuccessResponse, ErrorResponse } from "@/api";
import { RoomType } from "@/types/Room";

type RoomListType = {
    list: RoomType[];
    count: number;
    limit: number;
};

const groupsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getGroups: build.query<
            SuccessResponse<RoomListType> | ErrorResponse,
            { page: number; keyword?: string }
        >({
            query: ({ page, keyword }) =>
                `/management/groups?page=${page}${keyword ? `&keyword=${keyword}` : ""}`,
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
        addUsersToGroup: build.mutation<
            SuccessResponse<{ added: number[]; groupId: number }> | ErrorResponse,
            { userIds: number[]; groupId: number; admin?: boolean }
        >({
            query: ({ userIds, groupId, admin }) => {
                return {
                    url: `/management/groups/${groupId}/add`,
                    method: "PUT",
                    data: { userIds, admin },
                };
            },
            invalidatesTags: (res, _, args) =>
                res && res.status === "success"
                    ? [
                          ...res.data.added.map((id) => ({
                              type: "Groups" as const,
                              id: `USER_LIST_${id}`,
                          })),
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
        createGroup: build.mutation<
            SuccessResponse<{ group: RoomType }> | ErrorResponse,
            { name: string; avatarFileId?: number }
        >({
            query: (data) => {
                return { url: `/management/groups`, method: "POST", data };
            },
            invalidatesTags: (res) =>
                res && res.status === "success" ? [{ type: "Groups", id: "LIST" }] : [],
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
    useAddUsersToGroupMutation,
    useCreateGroupMutation,
} = groupsApi;
export default groupsApi;
