import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import MessageType, { MessageRecordType } from "../../../types/Message";

import type { RootState } from "../../../store/store";
import { dynamicBaseQuery } from "../../../api/api";
import { fetchHistory } from "./roomSlice";

export const fetchMessagesByRoomId = createAsyncThunk(
    "messages/fetchByIdStatus",
    async ({ page, roomId, messageId }: { page: number; roomId: number; messageId: number }) => {
        let url = `/messenger/messages/roomId/${roomId}?page=${page}`;
        if (messageId) url += `&messageId=${messageId}`;

        const response = await dynamicBaseQuery(url);
        return response.data;
    }
);

export const sendMessage = createAsyncThunk(
    "messages/sendMessage",
    async (
        data: {
            roomId: number;
            type: string;
            body: any;
        },
        thunkAPI
    ): Promise<{ message: MessageType }> => {
        const text = (thunkAPI.getState() as RootState).chat.messageText.trim();

        if (!text) {
            return;
        }

        if (data.type === "text" || data.type === "emoji") {
            data.body = { text };
        }

        const response = await dynamicBaseQuery({
            url: "/messenger/messages",
            data,
            method: "POST",
        });

        thunkAPI.dispatch(fetchHistory({ page: 1, keyword: "" }));
        return response.data;
    }
);

export const editMessageThunk = createAsyncThunk(
    "messages/editMessage",
    async (_, thunkAPI): Promise<{ message: MessageType }> => {
        const { editMessage: message, messageText } = (thunkAPI.getState() as RootState).chat;

        if (!messageText.trim()) {
            return;
        }

        const response = await dynamicBaseQuery({
            url: `/messenger/messages/${message.id}`,
            data: { text: messageText.trim() },
            method: "PUT",
        });

        thunkAPI.dispatch(fetchHistory({ page: 1, keyword: "" }));
        return response.data;
    }
);

export const replyMessageThunk = createAsyncThunk(
    "messages/replyMessage",
    async (type: string, thunkAPI): Promise<{ message: MessageType }> => {
        const { replyMessage: referenceMessage, messageText } = (thunkAPI.getState() as RootState)
            .chat;

        if (!messageText.trim()) {
            return;
        }

        const response = await dynamicBaseQuery({
            url: "/messenger/messages/",
            data: {
                roomId: referenceMessage.roomId,
                type,
                body: { referenceMessage, text: messageText.trim() },
                reply: true,
            },
            method: "POST",
        });

        thunkAPI.dispatch(fetchHistory({ page: 1, keyword: "" }));
        return response.data;
    }
);

interface ChatState {
    activeRoomId: number | null;
    messages: MessageType[];
    messagesByRoom: Record<number, MessageType[]>;
    messageRecords: MessageRecordType[];
    count: { roomId: number; count: number }[];
    loading: "idle" | "pending" | "succeeded" | "failed";
    sendingMessage: "idle" | "pending" | "succeeded" | "failed";
    messageText: string;
    editMessage: MessageType | null;
    replyMessage: MessageType | null;
    inputType: "text" | "emoji" | "files";
}

export const chatSlice = createSlice({
    name: <string>"chat",
    initialState: <ChatState>{
        activeRoomId: null,
        messages: [],
        messagesByRoom: {},
        messageRecords: [],
        count: [],
        loading: "idle",
        sendingMessage: "idle",
        messageText: "",
        editMessage: null,
        replyMessage: null,
        inputType: "text",
    },
    reducers: {
        setActiveRoomId: (state, { payload }: { payload: number | null }) => {
            state.activeRoomId = payload;
            state.replyMessage = null;
            state.editMessage = null;
            state.inputType = "text";
            state.messageText = "";
        },

        setMessageText: (state, { payload }: { payload: string }) => {
            state.messageText = payload;
        },

        setEditMessage: (state, { payload }: { payload: MessageType | null }) => {
            state.editMessage = payload;
            state.replyMessage = null;

            if (payload) {
                state.messageText = payload.body.text;
            }
        },

        setReplyMessage: (state, { payload }: { payload: MessageType | null }) => {
            state.replyMessage = payload;
            state.editMessage = null;
        },

        addMessage: (state, { payload }: { payload: MessageType }) => {
            if (state.messages.findIndex((m) => m.id === payload.id) === -1) {
                state.messages = [...state.messages, payload];

                if (payload) {
                    const roomId = payload.roomId;
                    state.messagesByRoom[roomId] ??= [];
                    state.messagesByRoom[roomId].push(payload);
                }
            }
        },
        addMessageRecord: (state, { payload }: { payload: MessageRecordType }) => {
            // prevent updating seenCount or deliveredCount for the same user twice (ie. when user sends seen/delivered record from multiple devices)
            const messageRecordHandled = state.messageRecords.some(
                (mr) =>
                    mr.messageId === payload.messageId &&
                    mr.userId === payload.userId &&
                    mr.type === payload.type &&
                    mr.type !== "reaction"
            );

            if (messageRecordHandled) {
                return;
            }

            state.messageRecords.push(payload);

            const messageIndex = state.messages.findIndex((m) => m.id === payload.messageId);
            if (messageIndex === -1) {
                return;
            }

            const updatedMessage: MessageType = { ...state.messages[messageIndex] };

            switch (payload.type) {
                case "seen": {
                    updatedMessage.seenCount += 1;
                    break;
                }
                case "delivered": {
                    updatedMessage.deliveredCount += 1;
                    break;
                }
                case "reaction": {
                    updatedMessage.messageRecords ??= [];
                    const existedIndex = updatedMessage.messageRecords.findIndex(
                        (m) => m.type === "reaction" && m.userId === payload.userId
                    );
                    if (existedIndex === -1) {
                        updatedMessage.messageRecords.push(payload);
                    } else updatedMessage.messageRecords.splice(existedIndex, 1, payload);
                    break;
                }
                default: {
                    console.log(`Add message record type {${payload.type}) not implemented!`);
                    break;
                }
            }

            state.messages.splice(messageIndex, 1, updatedMessage);

            const roomId = updatedMessage.roomId;
            const messageRoomIndex = state.messagesByRoom[roomId].findIndex(
                (m) => m.id === updatedMessage.id
            );

            console.log("messageRoomIndex", messageRoomIndex);
            console.log("updatedMessage", updatedMessage);
            if (messageRoomIndex > -1) {
                state.messagesByRoom[roomId].splice(messageRoomIndex, 1, updatedMessage);
            }
        },
        deleteMessage: (state, { payload }: { payload: MessageType }) => {
            const messageIndex = state.messages.findIndex((m) => m.id === payload.id);

            if (messageIndex > -1) {
                state.messages.splice(messageIndex, 1, payload);
            }

            const roomId = payload.roomId;
            const messageRoomIndex = state.messagesByRoom[roomId].findIndex(
                (m) => m.id === payload.id
            );

            if (messageRoomIndex > -1) {
                state.messagesByRoom[roomId].splice(messageRoomIndex, 1, payload);
            }
        },

        editMessage: (state, { payload }: { payload: MessageType }) => {
            const messageIndex = state.messages.findIndex((m) => m.id === payload.id);

            if (messageIndex > -1) {
                state.messages.splice(messageIndex, 1, payload);
            }

            const roomId = payload.roomId;
            const messageRoomIndex = state.messagesByRoom[roomId].findIndex(
                (m) => m.id === payload.id
            );

            if (messageRoomIndex > -1) {
                state.messagesByRoom[roomId].splice(messageRoomIndex, 1, payload);
            }
        },
        setInputType: (state, { payload }: { payload: "text" | "emoji" | "files" }) => {
            state.inputType = payload;
        },

        addEmoji: (state, { payload }: { payload: string }) => {
            state.messageText += payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(
            fetchMessagesByRoomId.fulfilled,
            (
                state,
                {
                    payload,
                    meta: {
                        arg: { roomId },
                    },
                }: any
            ) => {
                const messagesIds = state.messages.map((m) => m.id);
                const notAdded = payload.list.filter(
                    (m: { id: number }) => !messagesIds.includes(m.id)
                );

                if (roomId && state.count.findIndex((c) => c.roomId === roomId) < 0) {
                    state.count.push({
                        roomId: roomId,
                        count: payload.count,
                    });
                }
                state.messages = [...state.messages, ...notAdded];

                if (!state.messagesByRoom[roomId]) state.messagesByRoom[roomId] = [];

                state.messagesByRoom[roomId].push(...notAdded);

                state.loading = "idle";
            }
        );
        builder.addCase(fetchMessagesByRoomId.pending, (state) => {
            state.loading = "pending";
        });
        builder.addCase(fetchMessagesByRoomId.rejected, (state) => {
            state.loading = "failed";
        });

        builder.addCase(sendMessage.fulfilled, (state, { payload }) => {
            if (payload?.message) {
                state.messages = [...state.messages, payload.message];
                state.messagesByRoom[payload.message.roomId].push(payload.message);

                state.messageText = "";
            }
            state.inputType = "text";
            state.sendingMessage = "idle";
        });
        builder.addCase(sendMessage.pending, (state) => {
            state.sendingMessage = "pending";
        });
        builder.addCase(sendMessage.rejected, (state) => {
            state.sendingMessage = "failed";
        });

        builder.addCase(editMessageThunk.fulfilled, (state, { payload }) => {
            if (payload?.message) {
                state.messageText = "";
                state.inputType = "text";
                state.editMessage = null;
            }
        });

        builder.addCase(replyMessageThunk.fulfilled, (state, { payload }) => {
            if (payload?.message) {
                state.messages = [...state.messages, payload.message];
                state.messagesByRoom[payload.message.roomId].push(payload.message);
                state.messageText = "";
                state.inputType = "text";

                state.replyMessage = null;
            }
        });
    },
});

export const {
    setActiveRoomId,
    addMessage,
    addMessageRecord,
    deleteMessage,
    editMessage,
    setMessageText,
    setEditMessage,
    setReplyMessage,
    setInputType,
    addEmoji,
} = chatSlice.actions;

export const selectActiveRoomId = (state: RootState): number | null => state.chat.activeRoomId;
export const selectMessageText = (state: RootState): string => state.chat.messageText;
export const selectEditMessage = (state: RootState): MessageType | null => state.chat.editMessage;
export const selectReplyMessage = (state: RootState): MessageType | null => state.chat.replyMessage;
export const selectRoomMessages =
    (roomId: number) =>
    (state: RootState): MessageType[] => {
        if (!state.chat.messagesByRoom[roomId]) return [];

        return state.chat.messagesByRoom[roomId];
    };
export const selectRoomMessagesCount =
    (roomId: number) =>
    (state: RootState): number => {
        //const count = state.chat.messages.filter((m) => m.roomId === roomId).length;
        const countRow = state.chat.count.find((c) => c.roomId === roomId);
        return countRow?.count;
    };

export const selectLoading = (state: RootState): "idle" | "pending" | "succeeded" | "failed" => {
    return state.chat.loading;
};

export const selectSendingMessage = (state: RootState): boolean => {
    return state.chat.sendingMessage === "pending";
};

export const selectInputType = (state: RootState): "text" | "emoji" | "files" => {
    return state.chat.inputType;
};

export const selectInputTypeIsFiles = (state: RootState): boolean => {
    return state.chat.inputType === "files";
};

export default chatSlice.reducer;
