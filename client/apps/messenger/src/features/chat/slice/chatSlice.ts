import { createSlice } from "@reduxjs/toolkit";
import MessageType from "../../../types/Message";
import messageApi from "../api/message";

import type { RootState } from "../../../store/store";

interface ChatState {
    activeRoomId: number;
    messages: MessageType[];
    sendFiles: { roomId: number; files: File[] }[];
    sendImages: { roomId: number; images: File[] }[];
    count: { roomId: number; count: number }[];
}

export const chatSlice = createSlice({
    name: <string>"chat",
    initialState: <ChatState>{
        activeRoomId: null,
        messages: [],
        count: [],
        sendFiles: [],
        sendImages: [],
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

        addFiles: (state, { payload }: { payload: { roomId: number; files: File[] } }) => {
            const indx = state.sendFiles.findIndex((m) => m.roomId === payload.roomId);

            if (indx === -1) {
                state.sendFiles.push(payload);
                return;
            }

            state.sendFiles.splice(indx, 1, payload);
        },

        addImages: (state, { payload }: { payload: { roomId: number; images: File[] } }) => {
            const indx = state.sendImages.findIndex((m) => m.roomId === payload.roomId);

            if (indx === -1) {
                state.sendImages.push(payload);
                return;
            }

            state.sendImages.splice(indx, 1, payload);
        },
    },
    extraReducers: (builder) => {
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

export const { setActiveRoomId, addMessage, addFiles, addImages } = chatSlice.actions;

export const selectActiveRoomId = (state: RootState): number => state.chat.activeRoomId;
export const selectRoomMessages =
    (roomId: number) =>
    (state: RootState): { messages: MessageType[]; count: number } => {
        const messages = state.chat.messages.filter((m) => m.roomId === roomId);
        const count = state.chat.count.find((c) => c.roomId === roomId)?.count || 0;

        return { messages, count };
    };
export const selectSendImages =
    (roomId: number) =>
    (state: RootState): File[] => {
        const sendImages = state.chat.sendImages.find((s) => s.roomId === roomId);

        return sendImages?.images || [];
    };

export default chatSlice.reducer;
