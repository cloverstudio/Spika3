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
        updateRoom: build.mutation<{ room: RoomType }, { roomId: number; data: any }>({
            query: ({ roomId, data }) => {
                return { url: `/messenger/rooms/${roomId}`, method: "PUT", data };
            },
            invalidatesTags: (result, error, arg) => [{ type: "Rooms", id: arg.roomId }],
        }),
        muteRoom: build.mutation<{ room: RoomType }, any>({
            query: ({ roomId }) => {
                return { url: `/messenger/rooms/${roomId}/mute`, data: {}, method: "POST" };
            },
        }),
        unmuteRoom: build.mutation<{ room: RoomType }, any>({
            query: ({ roomId }) => {
                return { url: `/messenger/rooms/${roomId}/unmute`, data: {}, method: "POST" };
            },
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetRoomsQuery,
    useGetRoomByUserIdQuery,
    useGetRoomQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useMuteRoomMutation,
    useUnmuteRoomMutation,
} = roomApi;

export default roomApi;
