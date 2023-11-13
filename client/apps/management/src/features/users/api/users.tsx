import api, { SuccessResponse, ErrorResponse } from "@/api";

type UserType = {
    id: number;
    displayName: string;
    avatarFileId: number;
    isBot: boolean;
};

type DevicesType = {
    id: number;
    userId: number;
    type: string;
    osName: string;
    osVersion: string;
    deviceId: string;
    tokenExpiredAt: number;
    createdAt: number;
    modifiedAt: number;
    token: string;
};

type UserListType = {
    list: UserType[];
    count: number;
    limit: number;
};

const usersApi = api.injectEndpoints({
    endpoints: (build) => ({
        getUsers: build.query<
            SuccessResponse<UserListType> | ErrorResponse,
            { page: number; keyword?: string }
        >({
            query: ({ page, keyword }) =>
                `/management/users?page=${page}${keyword ? `&keyword=${keyword}` : ""}`,
            providesTags: [{ type: "Users", id: "LIST" }],
        }),
        getBots: build.query<
            SuccessResponse<UserListType> | ErrorResponse,
            { page: number; keyword?: string }
        >({
            query: ({ page, keyword }) =>
                `/management/users?bots=1&page=${page}${keyword ? `&keyword=${keyword}` : ""}`,
            providesTags: [{ type: "Bots", id: "LIST" }],
        }),
        getUserById: build.query<SuccessResponse<{ user: UserType }> | ErrorResponse, string>({
            query: (userId) => {
                return `/management/users/${userId}`;
            },
            providesTags: (res) =>
                res && res.status === "success" ? [{ type: "Users", id: res.data.user.id }] : [],
        }),
        getBotById: build.query<SuccessResponse<{ user: UserType }> | ErrorResponse, string>({
            query: (userId) => {
                return `/management/users/bot/${userId}`;
            },
            providesTags: (res) =>
                res && res.status === "success" ? [{ type: "Users", id: res.data.user.id }] : [],
        }),
        getUserDevices: build.query<
            SuccessResponse<{ devices: DevicesType[] }> | ErrorResponse,
            number
        >({
            query: (userId) => {
                return `/management/users/${userId}/devices`;
            },
            providesTags: (res, _, args) =>
                res && res.status === "success"
                    ? [
                          {
                              type: "Devices",
                              id: `USER_LIST_${args}`,
                          },
                      ]
                    : [],
        }),
        expireUserDevice: build.mutation<
            SuccessResponse<{ expired: boolean }> | ErrorResponse,
            { userId: number; deviceId: number }
        >({
            query: ({ userId, deviceId }) => {
                return {
                    url: `/management/users/${userId}/devices/${deviceId}/expire`,
                    method: "PUT",
                };
            },
            invalidatesTags: (res, _, args) =>
                res && res.status === "success"
                    ? [
                          {
                              type: "Devices",
                              id: `USER_LIST_${args.userId}`,
                          },
                      ]
                    : [],
        }),
        createBot: build.mutation<SuccessResponse<{ user: UserType }> | ErrorResponse, any>({
            query: (data) => {
                return { url: `/management/users/bot`, method: "POST", data };
            },
            invalidatesTags: (res) =>
                res && res.status === "success" ? [{ type: "Users", id: "LIST" }] : [],
        }),
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
        renewAccessToken: build.mutation<
            SuccessResponse<{ device: DevicesType }> | ErrorResponse,
            { userId: string }
        >({
            query: ({ userId }) => {
                return { url: `/management/users/bot/renewAccessToken/${userId}`, method: "PUT" };
            },
            invalidatesTags: (res) =>
                res && res.status === "success"
                    ? [
                          { type: "Users", id: "LIST" },
                          { type: "Users", id: res.data.device.userId },
                      ]
                    : [],
        }),
        updateBot: build.mutation<
            SuccessResponse<{ user: UserType }> | ErrorResponse,
            { userId: string; data: any }
        >({
            query: ({ userId, data }) => {
                return { url: `/management/users/bot/${userId}`, method: "PUT", data };
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
    useGetUserDevicesQuery,
    useExpireUserDeviceMutation,
    useGetBotByIdQuery,
    useCreateBotMutation,
    useUpdateBotMutation,
    useRenewAccessTokenMutation,
    useGetBotsQuery,
} = usersApi;
export default usersApi;
