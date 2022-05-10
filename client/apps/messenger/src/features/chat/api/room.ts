import Rooms, { RoomType } from "../../../types/Rooms";
import api from "../../../api/api";

const roomApi = api.injectEndpoints({
    endpoints: (build) => ({
        getRooms: build.query<Rooms, number>({
            query: (page) => `/messenger/rooms?page=${page}`,
            providesTags: [{ type: "Rooms", id: "LIST" }],
        }),
        getRoom: build.query<{ room: RoomType }, number>({
            query: (id) => `/messenger/rooms/${id}`,
            providesTags: (res) => res && res.room?.id && [{ type: "Rooms", id: res.room.id }],
        }),
        createRoom: build.mutation<{ room: RoomType }, any>({
            query: (data) => {
                return { url: "/messenger/rooms", data, method: "POST" };
            },
        }),
        getRoomByUserId: build.query<{ room: RoomType }, number>({
            query: (userId) => `/messenger/rooms/users/${userId}`,
            providesTags: (res) => res && res.room?.id && [{ type: "Rooms", id: res.room.id }],
        }),
        updateRoom: build.mutation<{ roomId: number; data: any }, any>({
            query: ({ roomId, data }) => {
                return { url: `/messenger/rooms/${roomId}`, method: "PUT", data };
            },
        }),
    }),
    overrideExisting: true,
});

<<<<<<< HEAD
export const {
    useGetHistoryQuery,
    useGetRoomsQuery,
    useGetRoomByUserIdQuery,
    useGetRoomQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
} = roomApi;
=======
export const { useGetRoomsQuery, useGetRoomByUserIdQuery, useGetRoomQuery, useCreateRoomMutation } =
    roomApi;
>>>>>>> work/1.0.0/main
export default roomApi;
