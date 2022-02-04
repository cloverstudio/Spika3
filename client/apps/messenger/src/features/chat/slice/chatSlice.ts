import { createSlice } from "@reduxjs/toolkit";
import Message from "../../../types/Message";
import messageApi from "../api/message";

import type { RootState } from "../../../store/store";

interface ChatState {
    activeRoomId: number;
    messages: Message[];
}

export const chatSlice = createSlice({
    name: <string>"chat",
    initialState: <ChatState>{ activeRoomId: null, messages: [] },
    reducers: {
        setActiveRoomId: (state, { payload }: { payload: number }) => {
            state.activeRoomId = payload;
        },

        addMessage: (state, { payload }: { payload: Message }) => {
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
    },
});

export const { setActiveRoomId, addMessage } = chatSlice.actions;

export const selectActiveRoomId = (state: RootState): number => state.chat.activeRoomId;
export const selectRoomMessages =
    (roomId: number) =>
    (state: RootState): Message[] =>
        state.chat.messages.filter((m) => m.roomId === roomId);

export default chatSlice.reducer;
