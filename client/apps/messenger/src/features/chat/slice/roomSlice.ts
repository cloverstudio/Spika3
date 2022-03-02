import { createSlice } from "@reduxjs/toolkit";
import roomApi from "../api/room";
import { RoomType } from "../../../types/Rooms";

import type { RootState } from "../../../store/store";
import messageApi from "../api/message";
import MessageType from "../../../types/Message";

interface RoomState {
    list: (RoomType & { lastMessage: MessageType })[];
    count: number;
}

export const roomSlice = createSlice({
    name: <string>"room",
    initialState: <RoomState>{ list: [], count: null },
    reducers: {
        setRoomLastMessage: (state, { payload }: { payload: MessageType }) => {
            const index = state.list.findIndex((r) => r.id === payload.roomId);

            state.list.splice(index, 1, { ...state.list[index], lastMessage: payload });
        },
    },
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
        builder.addMatcher(roomApi.endpoints.createRoom.matchFulfilled, (state, { payload }) => {
            const roomsIds = state.list.map((r) => r.id);
            const notAdded = roomsIds.includes(payload.room.id);

            if (!notAdded) {
                state.list = [{ ...payload.room, lastMessage: null }, ...state.list];
                state.count += 1;
            }
        });
    },
});

export const { setRoomLastMessage } = roomSlice.actions;

export const selectRoomById =
    (id: number) =>
    (state: RootState): RoomType & { lastMessage: MessageType } =>
        state.room.list.find((r) => r.id === id);

export const selectHistory = (state: RootState): RoomState => state.room;

export default roomSlice.reducer;
