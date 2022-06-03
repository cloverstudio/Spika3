import api from "./api";
import RoomType, { RoomListType } from "../types/Room";
import { string } from "yup";

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
} = roomApi;
export default roomApi;
