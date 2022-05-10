import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import MessageType from "../../../types/Message";

import type { RootState } from "../../../store/store";
import { dynamicBaseQuery } from "../../../api/api";

export const fetchMessagesByRoomId = createAsyncThunk(
    "messages/fetchByIdStatus",
    async (page: number, thunkAPI) => {
        const roomId = (thunkAPI.getState() as RootState).chat.activeRoomId;

        const response = await dynamicBaseQuery(
            `/messenger/messages/roomId/${roomId}?page=${page}`
        );
        return response.data;
    }
);

interface ChatState {
    activeRoomId: number;
    messages: MessageType[];
    count: { roomId: number; count: number }[];
    loading: "idle" | "pending" | "succeeded" | "failed";
}

export const chatSlice = createSlice({
    name: <string>"chat",
    initialState: <ChatState>{
        activeRoomId: null,
        messages: [],
        count: [],
        loading: "idle",
    },
    reducers: {
        setActiveRoomId: (state, { payload }: { payload: number }) => {
            state.activeRoomId = payload;
        },

        addMessage: (state, { payload }: { payload: MessageType }) => {
            if (state.messages.findIndex((m) => m.id === payload.id) === -1) {
                state.messages = [...state.messages, payload];
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMessagesByRoomId.fulfilled, (state, { payload }: any) => {
            const messagesIds = state.messages.map((m) => m.id);
            const notAdded = payload.list.filter(
                (m: { id: number }) => !messagesIds.includes(m.id)
            );

            if (state.count.findIndex((c) => c.roomId === state.activeRoomId) < 0) {
                state.count.push({
                    roomId: state.activeRoomId,
                    count: payload.count,
                });
            }
            state.messages = [...state.messages, ...notAdded];
            state.loading = "idle";
        });
        builder.addCase(fetchMessagesByRoomId.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(fetchMessagesByRoomId.rejected, (state) => {
            state.loading = "failed";
        });
    },
});

export const { setActiveRoomId, addMessage } = chatSlice.actions;

export const selectActiveRoomId = (state: RootState): number => state.chat.activeRoomId;
export const selectRoomMessages =
    (roomId: number) =>
    (state: RootState): { messages: MessageType[]; count: number } => {
        const messages = state.chat.messages.filter((m) => m.roomId === roomId);
        const count = state.chat.count.find((c) => c.roomId === roomId)?.count || 0;

        return { messages, count };
    };
export const selectLoading =
    () =>
    (state: RootState): "idle" | "pending" | "succeeded" | "failed" => {
        return state.chat.loading;
    };

export default chatSlice.reducer;
