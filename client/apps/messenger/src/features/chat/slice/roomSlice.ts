import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import roomApi from "../api/room";
import { RoomType } from "../../../types/Rooms";

import type { RootState } from "../../../store/store";
import messageApi from "../api/message";
import MessageType from "../../../types/Message";
import { dynamicBaseQuery } from "../../../api/api";

interface RoomState {
    list: (RoomType & { lastMessage: MessageType })[];
    count: number;
    loading: "idle" | "pending" | "succeeded" | "failed";
}

export const fetchHistory = createAsyncThunk("room/fetchHistory", async (page: number) => {
    const response = await dynamicBaseQuery(`/messenger/history?page=${page}`);
    return response.data;
});

export const roomSlice = createSlice({
    name: <string>"room",
    initialState: <RoomState>{ list: [], count: null, loading: "idle" },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchHistory.fulfilled, (state, { payload }: any) => {
            const roomsIds = state.list.map((r) => r.id);
            const notAdded = payload.list.filter((u: any) => !roomsIds.includes(u.id));
            const list = state.list.map((room) => {
                const id = room.id;

                const newRoomInfo = payload.list.find((nr: any) => nr.id === id);

                return newRoomInfo || room;
            });

            state.list = [...list, ...notAdded];
            state.count = payload.count;
            state.loading = "idle";
        });
        builder.addCase(fetchHistory.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(fetchHistory.rejected, (state) => {
            state.loading = "failed";
        });
        builder.addMatcher(roomApi.endpoints.createRoom.matchFulfilled, (state, { payload }) => {
            const roomsIds = state.list.map((r) => r.id);
            const notAdded = roomsIds.includes(payload.room.id);

            if (!notAdded) {
                state.list = [{ ...payload.room, lastMessage: null }, ...state.list];
                state.count += 1;
            }
        });
        builder.addMatcher(
            messageApi.endpoints.markRoomMessagesAsSeen.matchFulfilled,
            (state, { meta }) => {
                const index = state.list.findIndex((r) => r.id === meta.arg.originalArgs);

                if (index > -1) {
                    state.list.splice(index, 1, {
                        ...state.list[index],
                        unreadCount: 0,
                    });
                }
            }
        );
    },
});

export const selectRoomById =
    (id: number) =>
    (state: RootState): RoomType & { lastMessage: MessageType } =>
        state.room.list.find((r) => r.id === id);

export const selectHistory = (state: RootState): RoomState => state.room;
export const selectHistoryLoading =
    () =>
    (state: RootState): "idle" | "pending" | "succeeded" | "failed" =>
        state.room.loading;

export default roomSlice.reducer;
