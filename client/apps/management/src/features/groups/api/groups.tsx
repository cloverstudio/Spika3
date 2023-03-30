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

const groupsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getGroupsByUserId: build.query<
            SuccessResponse<{ rooms: RoomsType[] }> | ErrorResponse,
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
                      ]
                    : [],
        }),
    }),
    overrideExisting: true,
});

export const { useRemoveUserFromGroupMutation, useGetGroupsByUserIdQuery } = groupsApi;
export default groupsApi;
