import api, { SuccessResponse, ErrorResponse } from "@/api";

type UserType = {
    id: number;
    displayName: string;
    avatarFileId: number;
};

type DevicesType = {
    id: number;
    type: string;
    osName: string;
    osVersion: string;
    deviceId: string;
    tokenExpiredAt: number;
    createdAt: number;
    modifiedAt: number;
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
    useGetUserDevicesQuery,
    useExpireUserDeviceMutation,
} = usersApi;
export default usersApi;
