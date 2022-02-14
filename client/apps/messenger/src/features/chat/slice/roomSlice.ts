import { createSlice } from "@reduxjs/toolkit";
import roomApi from "../api/room";
import { RoomHistory } from "../../../types/Rooms";

import type { RootState } from "../../../store/store";
import messageApi from "../api/message";

interface RoomState {
    list: RoomHistory[];
    count: number;
}

export const roomSlice = createSlice({
    name: <string>"room",
    initialState: <RoomState>{ list: [], count: null },
    reducers: {},
    extraReducers: (builder) => {
        builder.addMatcher(roomApi.endpoints.getHistory.matchFulfilled, (state, { payload }) => {
            const roomsIds = state.list.map((r) => r.id);
            const notAdded = payload.list.filter((u) => !roomsIds.includes(u.id));

            state.list = [...state.list, ...notAdded];
            state.count = payload.count;
        });
        builder.addMatcher(
            messageApi.endpoints.sendMessage.matchFulfilled,
            (state, { payload, meta }) => {
                const lastMessage = {
                    ...payload.message,
                    messageBody: meta.arg.originalArgs.message,
                };

                const index = state.list.findIndex((r) => r.id === payload.message.roomId);

                state.list.splice(index, 1, { ...state.list[index], lastMessage });
            }
        );
    },
});

export const selectRoomById =
    (id: number) =>
    (state: RootState): RoomHistory =>
        state.room.list.find((r) => r.id === id);

export const selectHistory = (state: RootState): RoomState => state.room;

export default roomSlice.reducer;
