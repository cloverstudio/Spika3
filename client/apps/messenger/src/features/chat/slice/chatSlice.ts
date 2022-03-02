import { createSlice } from "@reduxjs/toolkit";
import MessageType from "../../../types/Message";
import messageApi from "../api/message";

import type { RootState } from "../../../store/store";

interface ChatState {
    activeRoomId: number;
    messages: MessageType[];
    count: { roomId: number; count: number }[];
}

export const chatSlice = createSlice({
    name: <string>"chat",
    initialState: <ChatState>{ activeRoomId: null, messages: [], count: [] },
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
        builder.addMatcher(
            messageApi.endpoints.sendMessage.matchFulfilled,
            (state, { payload, meta }) => {
                const message = {
                    ...payload.message,
                    messageBody: meta.arg.originalArgs.message,
                };

                state.messages = [...state.messages, message];
            }
        );
        builder.addMatcher(
            messageApi.endpoints.getMessagesByRoomId.matchFulfilled,
            (state, { payload, meta }) => {
                const messagesIds = state.messages.map((m) => m.id);
                const notAdded = payload.list.filter(
                    (m: { id: number }) => !messagesIds.includes(m.id)
                );

                if (state.count.findIndex((c) => c.roomId === meta.arg.originalArgs.roomId) < 0) {
                    state.count.push({
                        roomId: meta.arg.originalArgs.roomId,
                        count: payload.count,
                    });
                }
                state.messages = [...state.messages, ...notAdded];
            }
        );
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

export default chatSlice.reducer;
