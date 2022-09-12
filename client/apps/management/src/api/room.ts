import api from "./api";
import RoomType, { RoomListType, RoomMixType } from "../types/Room";
import UserType, { UserListType } from "../types/User";

const roomApi = api.injectEndpoints({
    endpoints: (build) => ({
        getRooms: build.query<RoomListType, number>({
            query: (page) => `/management/room?page=${page}`,
            providesTags: [{ type: "Rooms", id: "LIST" }],
        }),
        getRoomsForUser: build.query<RoomListType, { page: number; userId: string }>({
            query: ({ page, userId }) => `/management/room?page=${page}&userId=${userId}`,
            providesTags: [{ type: "Rooms", id: "LIST" }],
        }),
        createRoom: build.mutation<{ room: RoomType }, any>({
            query: (data) => {
                return { url: "/management/room", data, method: "POST" };
            },
        }),
        getRoomById: build.query<{ room: RoomType }, string>({
            query: (roomId) => {
                return `/management/room/${roomId}`;
            },
        }),
        updateRoom: build.mutation<{ room: RoomType }, { roomId: string; data: any }>({
            query: ({ roomId, data }) => {
                return { url: `/management/room/${roomId}`, method: "PUT", data };
            },
            invalidatesTags: (res) => res && [{ type: "Rooms", id: "LIST" }],
        }),
        deleteRoom: build.mutation<{ roomId: string }, any>({
            query: (roomId) => {
                return { url: `/management/room/${roomId}`, method: "DELETE" };
            },
            invalidatesTags: (res) => res && [{ type: "Rooms", id: "LIST" }],
        }),
        getDeletedRooms: build.query<RoomListType, { page: number; deleted: boolean }>({
            query: ({ page, deleted }) => `/management/room?page=${page}&deleted=${deleted}`,
            providesTags: [{ type: "Rooms", id: "LIST" }],
        }),
        getDeletedRoomsForUser: build.query<
            RoomListType,
            { page: number; userId: string; deleted: boolean }
        >({
            query: ({ page, userId, deleted }) =>
                `/management/room?page=${page}&userId=${userId}&deleted=${deleted}`,
            providesTags: [{ type: "Rooms", id: "LIST" }],
        }),
        getRoomsBySearchTerm: build.query<RoomListType, string>({
            query: (searchTerm) => `/management/room/search?searchTerm=${searchTerm}`,
            providesTags: [{ type: "Rooms", id: "LIST" }],
        }),
        getGroupRooms: build.query<RoomListType, { page: number; type: string }>({
            query: ({ page, type }) => `/management/room/group?page=${page}&type=${type}`,
            providesTags: [{ type: "Rooms", id: "LIST" }],
        }),
        getUsersForRoom: build.query<RoomMixType, number>({
            query: (roomId) => `/management/room/users?roomId=${roomId}`,
            providesTags: [{ type: "RoomUser", id: "USERS" }],
        }),
        deleteUserInRoom: build.mutation<
            { users: UserListType },
            { roomId: number; userId: number }
        >({
            query: ({ roomId, userId }) => {
                return { url: `/management/room/${roomId}/${userId}`, method: "DELETE" };
            },
            invalidatesTags: (res) => res && [{ type: "RoomUser", id: "USERS" }],
        }),
        addUsersToRoom: build.mutation<any, { roomId: number; userIds: number[] }>({
            query: ({ roomId, userIds }) => {
                return {
                    url: `/management/room/addUsers?roomId=${roomId}&userIds=${userIds}`,
                    method: "PUT",
                };
            },
            invalidatesTags: (res) => res && [{ type: "RoomUser", id: "USERS" }],
        }),
        updateAdminForRoom: build.mutation<any, { roomId: number; userId: number }>({
            query: ({ roomId, userId }) => {
                return {
                    url: `/management/room/userAdmin?roomId=${roomId}&userId=${userId}`,
                    method: "PUT",
                };
            },
            invalidatesTags: (res) => res && [{ type: "RoomUser", id: "USERS" }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetRoomsQuery,
    useGetRoomsForUserQuery,
    useCreateRoomMutation,
    useGetRoomByIdQuery,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useGetDeletedRoomsQuery,
    useGetDeletedRoomsForUserQuery,
    useGetRoomsBySearchTermQuery,
    useGetGroupRoomsQuery,
    useGetUsersForRoomQuery,
    useDeleteUserInRoomMutation,
    useAddUsersToRoomMutation,
    useUpdateAdminForRoomMutation,
} = roomApi;
export default roomApi;
