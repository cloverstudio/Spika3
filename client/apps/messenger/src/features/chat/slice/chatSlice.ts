import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import MessageType, { MessageRecordType } from "../../../types/Message";

import type { RootState } from "../../../store/store";
import { dynamicBaseQuery } from "../../../api/api";

export const fetchMessagesByRoomId = createAsyncThunk(
    "messages/fetchByIdStatus",
    async ({ page, roomId }: { page: number; roomId: number }) => {
        const response = await dynamicBaseQuery(
            `/messenger/messages/roomId/${roomId}?page=${page}`
        );
        return response.data;
    }
);

interface ChatState {
    activeRoomId: number;
    messages: MessageType[];
    messageRecords: MessageRecordType[];
    count: { roomId: number; count: number }[];
    loading: "idle" | "pending" | "succeeded" | "failed";
}

export const chatSlice = createSlice({
    name: <string>"chat",
    initialState: <ChatState>{
        activeRoomId: null,
        messages: [],
        messageRecords: [],
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
        addMessageRecord: (state, { payload }: { payload: MessageRecordType }) => {
            // prevent updating seenCount or deliveredCount for the same user twice (ie. when user sends seen/delivered record from multiple devices)
            const messageRecordHandled = state.messageRecords.some(
                (mr) =>
                    mr.messageId === payload.messageId &&
                    mr.userId === payload.userId &&
                    mr.type === payload.type
            );
            if (messageRecordHandled) {
                return;
            }

            state.messageRecords.push(payload);

            const messageIndex = state.messages.findIndex((m) => m.id === payload.messageId);
            if (messageIndex === -1) {
                return;
            }

            const updatedMessage = { ...state.messages[messageIndex] };

            switch (payload.type) {
                case "seen": {
                    updatedMessage.seenCount += 1;
                    break;
                }
                case "delivered": {
                    updatedMessage.deliveredCount += 1;
                    break;
                }
                default: {
                    console.log(`Add message record type {${payload.type}) not implemented!`);
                    break;
                }
            }

            state.messages.splice(messageIndex, 1, updatedMessage);
        },
        deleteMessage: (state, { payload }: { payload: MessageType }) => {
            const messageIndex = state.messages.findIndex((m) => m.id === payload.id);

            if (messageIndex > -1) {
                state.messages.splice(messageIndex, 1, payload);
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

export const { setActiveRoomId, addMessage, addMessageRecord, deleteMessage } = chatSlice.actions;

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
