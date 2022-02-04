import { createSlice } from "@reduxjs/toolkit";
import roomApi from "../api/room";
import { Room } from "../../../types/Rooms";

import type { RootState } from "../../../store/store";

interface RoomState {
    list: Room[];
    count: number;
}

export const roomSlice = createSlice({
    name: <string>"room",
    initialState: <RoomState>{ list: [], count: null },
    reducers: {},
    extraReducers: (builder) => {
        builder.addMatcher(roomApi.endpoints.getRooms.matchFulfilled, (state, { payload }) => {
            const roomsIds = state.list.map((r) => r.id);
            const notAdded = payload.list.filter((u) => !roomsIds.includes(u.id));

            state.list = [...state.list, ...notAdded];
            state.count = payload.count;
        });
    },
});

export const selectRoomByUserId =
    (userId: number) =>
    (state: RootState): Room =>
        state.room.list.find(
            (r) => r.type === "private" && r.users.map((u) => u.userId).includes(userId)
        );

export const selectRoomById =
    (id: number) =>
    (state: RootState): Room =>
        state.room.list.find((r) => r.id === id);

export const selectHistory = (state: RootState): RoomState => state.room;

export default roomSlice.reducer;
