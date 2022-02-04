import Rooms, { Room } from "../../../types/Rooms";
import api from "../../../api/api";

const roomApi = api.injectEndpoints({
    endpoints: (build) => ({
        getRooms: build.query<Rooms, number>({
            query: (page) => `/messenger/rooms?page=${page}`,
            providesTags: [{ type: "Rooms", id: "LIST" }],
        }),
        getRoom: build.query<{ room: Room }, number>({
            query: (id) => `/messenger/rooms/${id}`,
            providesTags: (res) => res && res.room?.id && [{ type: "Rooms", id: res.room.id }],
        }),
        createRoom: build.mutation<{ room: Room }, any>({
            query: (data) => {
                return { url: "/messenger/rooms", data, method: "POST" };
            },
            invalidatesTags: (res) => res && res.room?.id && [{ type: "Rooms", id: "LIST" }],
        }),
        getRoomByUserId: build.query<{ room: Room }, number>({
            query: (userId) => `/messenger/rooms/users/${userId}`,
            providesTags: (res) => res && res.room?.id && [{ type: "Rooms", id: res.room.id }],
        }),
    }),
    overrideExisting: true,
});

export const { useGetRoomsQuery, useGetRoomByUserIdQuery, useGetRoomQuery, useCreateRoomMutation } =
    roomApi;
export default roomApi;
