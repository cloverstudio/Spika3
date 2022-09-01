import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import roomApi from "../api/room";
import { RoomType } from "../../../types/Rooms";

import type { RootState } from "../../../store/store";
import messageApi from "../api/message";
import MessageType from "../../../types/Message";
import { dynamicBaseQuery } from "../../../api/api";

import * as utils from "../../../../../../lib/utils";

interface RoomState {
    list: (RoomType & { lastMessage: MessageType })[];
    count: number;
    loading: "idle" | "pending" | "succeeded" | "failed";
    keyword: string;
}

export const fetchHistory = createAsyncThunk(
    "room/fetchHistory",
    async (args: { page: number; keyword: string }) => {
        const response = await dynamicBaseQuery(
            `/messenger/history?page=${args.page}&keyword=${args.keyword}`
        );

        return {
            data: response.data,
            keyword: args.keyword,
            page: args.page,
        };
    }
);

export const roomSlice = createSlice({
    name: <string>"room",
    initialState: <RoomState>{ list: [], count: null, loading: "idle", keyword: "" },
    reducers: {
        refreshOne(state, { payload: updatedRoom }: { payload: RoomType }) {
            const list = state.list.map((room) => {
                if (updatedRoom.id === room.id) {
                    room.avatarUrl = updatedRoom.avatarUrl;
                    room.name = updatedRoom.name;
                    room.users = updatedRoom.users;
                }

                return room;
            });

            state.list = [...list];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchHistory.fulfilled, (state, { payload }: any) => {
            const roomsIds = state.list.map((r) => r.id);
            const notAdded = payload.data.list.filter((u: any) => !roomsIds.includes(u.id));

            const list = state.list.map((room) => {
                const id = room.id;

                const newRoomInfo = payload.data.list.find((nr: any) => nr.id === id);

                return newRoomInfo || room;
            });

            if (state.keyword !== payload.keyword && payload.page === 1) {
                state.list = [...payload.data.list];
            } else {
                state.list = [...list, ...notAdded];
            }

            state.count = payload.data.count;
            state.loading = "idle";
            state.keyword = `${payload.keyword}`;
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

export const { refreshOne } = roomSlice.actions;

export default roomSlice.reducer;
