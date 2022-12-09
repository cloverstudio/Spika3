import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { wait } from "../../../../../../lib/utils";
import { dynamicBaseQuery } from "../../../api/api";
import type { RootState } from "../../../store/store";
import MessageType, { MessageListType, MessageRecordType } from "../../../types/Message";
import uploadFile from "../../../utils/uploadFile";
import { getVideoThumbnail } from "../../../utils/media";
import generateThumbFile from "../lib/generateThumbFile";
import getFileType from "../lib/getFileType";
import getMessageStatus from "../lib/getMessageStatus";
import { fetchHistory } from "./leftSidebar";
import { RoomType } from "../../../types/Rooms";

export const fetchMessages = createAsyncThunk(
    "messages/fetchMessages",
    async (
        {
            roomId,
            targetMessageId,
            cursor,
        }: {
            roomId: number;
            targetMessageId?: number;
            cursor?: number;
        },
        thunkAPI
    ) => {
        const room = (thunkAPI.getState() as RootState).messages[roomId];
        const { count } = room || {};

        if (count && !cursor && !targetMessageId) {
            console.error("fetchMessagesError: Nothing to load");

            throw new Error("fetchMessagesError: Nothing to load");
        }

        let url = `/messenger/messages/roomId/${roomId}?`;
        if (targetMessageId) {
            url += `&targetMessageId=${targetMessageId}`;
        }

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

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
        const { roomId, type, body } = data;
        const text = (thunkAPI.getState() as RootState).input.list[roomId]?.text.trim() || "";
        const fromUserId = (thunkAPI.getState() as RootState).user.id;

        if (!text && (type === "text" || type === "emoji")) {
            throw new Error("no text");
        }

        const localId = Math.round(Math.random() * 1000000000000000000000).toString();

        if (type === "text" || type === "emoji") {
            body.text = text;
        }

        body.localId = localId;

        thunkAPI.dispatch(
            messagesSlice.actions.setSending({
                roomId,
                type,
                body,
                status: "sending",
                localId,
                fromUserId,
            })
        );

        try {
            const response = await dynamicBaseQuery({
                url: "/messenger/messages",
                data: {
                    roomId,
                    type,
                    body,
                    localId,
                },
                method: "POST",
            });

            thunkAPI.dispatch(fetchHistory({ page: 1, keyword: "" }));

            return response.data;
        } catch (error) {
            thunkAPI.dispatch(
                messagesSlice.actions.setSending({
                    roomId,
                    type,
                    body,
                    status: "failed",
                    localId,
                    fromUserId,
                })
            );
            console.error({ error });
            throw error;
        }
    }
);

export const sendFileMessage = createAsyncThunk(
    "messages/sendFileMessage",
    async (
        data: {
            roomId: number;
            file: File;
        },
        thunkAPI
    ): Promise<{ message: MessageType }> => {
        const { roomId, file } = data;
        const fromUserId = (thunkAPI.getState() as RootState).user.id;

        const localId = Math.round(Math.random() * 1000000000000000000000).toString();
        const type = getFileType(file.type);
        const body: any = {};

        thunkAPI.dispatch(
            messagesSlice.actions.setSending({
                roomId,
                type,
                body: {
                    uploadingFileName: file.name,
                },
                status: "sending",
                localId,
                fromUserId,
            })
        );

        try {
            const uploaded = await uploadFile({
                file,
                type: file.type || "unknown",
            });

            body.fileId = uploaded.id;

            if (type === "image") {
                const thumbFile = await generateThumbFile(file);
                if (thumbFile) {
                    const thumbFileUploaded = await uploadFile({
                        file: thumbFile,
                        type: thumbFile.type || "unknown",
                    });

                    body.thumbId = thumbFileUploaded.id;
                }
            }
            if (/^.*video.*$/.test(file.type)) {
                console.log("vide type", type, file.type);
                const thumbFile = await getVideoThumbnail(file);
                if (thumbFile) {
                    const thumbFileUploaded = await uploadFile({
                        file: thumbFile,
                        type: thumbFile.type || "image/jpeg",
                    });

                    body.thumbId = thumbFileUploaded.id;
                }
            }
            const response = await dynamicBaseQuery({
                url: "/messenger/messages",
                data: {
                    roomId,
                    type,
                    body,
                    localId,
                },
                method: "POST",
            });

            thunkAPI.dispatch(fetchHistory({ page: 1, keyword: "" }));

            return response.data;
        } catch (error) {
            thunkAPI.dispatch(
                messagesSlice.actions.setSending({
                    roomId,
                    type,
                    body: {
                        uploadingFileName: file.name,
                    },
                    status: "failed",
                    localId,
                    fromUserId,
                })
            );
            console.error({ error });
            throw error;
        }
    }
);

export const editMessageThunk = createAsyncThunk(
    "messages/editMessage",
    async (roomId: number, thunkAPI): Promise<{ message: MessageType }> => {
        const { editMessage: message, text } = (thunkAPI.getState() as RootState).input.list[
            roomId
        ];

        if (!text.trim()) {
            return;
        }

        const { type, body: currentBody, fromUserId, id, reply, createdAt } = message;
        const body = { ...currentBody, text: text.trim() };

        thunkAPI.dispatch(
            messagesSlice.actions.setSending({
                roomId,
                type,
                body,
                localId: id.toString(),
                fromUserId,
                status: "sending",
                reply,
                createdAt,
            })
        );

        try {
            const response = await dynamicBaseQuery({
                url: `/messenger/messages/${message.id}`,
                data: { text: text.trim() },
                method: "PUT",
            });

            thunkAPI.dispatch(fetchHistory({ page: 1, keyword: "" }));

            return response.data;
        } catch (error) {
            thunkAPI.dispatch(
                messagesSlice.actions.setSending({
                    roomId,
                    type,
                    body,
                    localId: id.toString(),
                    fromUserId,
                    status: "failed",
                    reply,
                    createdAt,
                })
            );

            console.error({ error });
            throw error;
        }
    }
);

export const replyMessageThunk = createAsyncThunk(
    "messages/replyMessage",
    async (
        { type, roomId }: { type: string; roomId: number },
        thunkAPI
    ): Promise<{ message: MessageType }> => {
        const { replyMessage: referenceMessage, text } = (thunkAPI.getState() as RootState).input
            .list[roomId];
        const fromUserId = (thunkAPI.getState() as RootState).user.id;

        if (!text.trim()) {
            return;
        }

        const localId = Math.round(Math.random() * 1000000000000000000000).toString();
        const body = { referenceMessage, text: text.trim() };

        thunkAPI.dispatch(
            messagesSlice.actions.setSending({
                roomId,
                type,
                body,
                status: "sending",
                localId,
                fromUserId,
                reply: true,
            })
        );

        try {
            const response = await dynamicBaseQuery({
                url: "/messenger/messages/",
                data: {
                    roomId,
                    type,
                    body,
                    reply: true,
                    localId,
                },
                method: "POST",
            });

            thunkAPI.dispatch(fetchHistory({ page: 1, keyword: "" }));

            return response.data;
        } catch (error) {
            thunkAPI.dispatch(
                messagesSlice.actions.setSending({
                    roomId,
                    type,
                    body,
                    status: "failed",
                    localId,
                    fromUserId,
                    reply: true,
                })
            );

            console.error({ error });
            throw error;
        }
    }
);

type InitialState = {
    [roomId: number]: {
        roomId: number;
        loading: boolean;
        messages: { [id: string]: MessageType };
        reactions: { [messageId: string]: MessageRecordType[] };
        statusCounts: {
            [messageId: string]: {
                seenCount: number;
                deliveredCount: number;
                totalUserCount: number;
            };
        };
        showDetails: boolean;
        showDelete: boolean;
        activeMessageId: number | null;
        count?: number;
        cursor?: number;
    };
};

export const messagesSlice = createSlice({
    name: <string>"messages",
    initialState: <InitialState>{ list: {} },
    reducers: {
        setSending(
            state,
            action: {
                payload: {
                    status: string;
                    body: any;
                    type: string;
                    localId: string;
                    roomId: number;
                    fromUserId: number;
                    reply?: boolean;
                    createdAt?: number;
                };
            }
        ) {
            const {
                roomId,
                status,
                body,
                localId,
                type,
                fromUserId,
                reply = false,
                createdAt = +Date.now(),
            } = action.payload;
            const room = state[roomId];

            room.messages[localId] = {
                status,
                body,
                localId: `${localId}`,
                type,
                createdAt,
                modifiedAt: Date.now(),
                id: +localId,
                roomId,
                fromUserId,
                fromDeviceId: 2,
                deleted: false,
                deliveredCount: 0,
                seenCount: 0,
                reply,
                totalUserCount: 100,
                messageRecords: [],
            };
        },
        addMessage(state, action: { payload: MessageType }) {
            const message = action.payload;
            const { roomId, totalUserCount, deliveredCount, seenCount } = message;

            const room = state[roomId];
            if (room) {
                room.messages[message.id] = message;
                room.reactions[message.id] = [];
                room.statusCounts[message.id] = { totalUserCount, deliveredCount, seenCount };
            }
        },

        addMessageRecord(state, action: { payload: MessageRecordType }) {
            const messageRecord = action.payload;

            const { roomId, messageId, type } = messageRecord;

            const room = state[roomId];

            if (!room) {
                return;
            }

            if (type === "reaction") {
                if (room.reactions[messageId]) {
                    room.reactions[messageId] = room.reactions[messageId].filter(
                        (r) => r.userId !== messageRecord.userId
                    );
                    room.reactions[messageId].push(messageRecord);
                } else {
                    room.reactions[messageId] = [messageRecord];
                }
            } else {
                if (room.statusCounts[messageId]) {
                    if (type === "seen") {
                        if (room.statusCounts[messageId]?.seenCount) {
                            room.statusCounts[messageId].seenCount += 1;
                        } else {
                            room.statusCounts[messageId].seenCount = 1;
                        }
                    } else if (type === "delivered") {
                        if (room.statusCounts[messageId]?.deliveredCount) {
                            room.statusCounts[messageId].deliveredCount += 1;
                        } else {
                            room.statusCounts[messageId].deliveredCount = 1;
                        }
                    }
                }
            }
        },

        showMessageDetails(state, action: { payload: { roomId: number; messageId: number } }) {
            const { roomId, messageId } = action.payload;
            const room = state[roomId];

            if (room) {
                room.activeMessageId = messageId;
                room.showDetails = true;
            }
        },

        hideMessageDetails(state, action: { payload: number }) {
            const roomId = action.payload;
            const room = state[roomId];

            if (room) {
                room.activeMessageId = null;
                room.showDetails = false;
            }
        },

        showDeleteModal(state, action: { payload: { roomId: number; messageId: number } }) {
            const { roomId, messageId } = action.payload;
            const room = state[roomId];

            if (room) {
                room.activeMessageId = messageId;
                room.showDetails = false;
                room.showDelete = true;
            }
        },

        hideDeleteModal(state, action: { payload: number }) {
            const roomId = action.payload;
            const room = state[roomId];

            if (room) {
                room.activeMessageId = null;
                room.showDelete = false;
            }
        },

        deleteMessage: (state, { payload }: { payload: MessageType }) => {
            const roomId = payload.roomId;
            const room = state[roomId];

            if (room) {
                room.messages[payload.id] = { ...payload, messageRecords: [] };
            }
        },

        editMessage: (state, { payload }: { payload: MessageType }) => {
            const roomId = payload.roomId;
            const room = state[roomId];

            if (room) {
                room.messages[payload.id] = { ...payload, messageRecords: [] };
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(
            fetchMessages.fulfilled,
            (state, { payload, meta }: { payload: MessageListType; meta: any }) => {
                const roomId = meta.arg.roomId;

                state[roomId].count = payload.count;
                state[roomId].cursor = payload.nextCursor;
                state[roomId].loading = false;

                payload.list.forEach((m) => {
                    const { messageRecords, totalUserCount, deliveredCount, seenCount, id } = m;
                    state[roomId].messages[id] = m;
                    state[roomId].reactions[id] = messageRecords || [];
                    state[roomId].statusCounts[id] = { totalUserCount, deliveredCount, seenCount };
                });
            }
        );
        builder.addCase(fetchMessages.pending, (state, { meta }) => {
            const roomId = meta.arg.roomId;
            const room = state[roomId];

            if (!room) {
                state[roomId] = {
                    roomId,
                    messages: {},
                    reactions: {},
                    statusCounts: {},
                    loading: true,
                    activeMessageId: null,
                    showDetails: false,
                    showDelete: false,
                };
            } else {
                room.loading = true;
            }
        });

        builder.addCase(fetchMessages.rejected, (state, { meta }) => {
            const roomId = meta.arg.roomId;
            const room = state[roomId];

            room.loading = false;
        });

        builder.addCase(sendMessage.fulfilled, (state, { payload }) => {
            const { message } = payload;
            const {
                id,
                roomId,
                localId,
                messageRecords,
                totalUserCount,
                deliveredCount,
                seenCount,
            } = message;

            const room = state[roomId];

            delete room.messages[localId];
            room.messages[id] = message;
            room.reactions[id] = messageRecords || [];
            room.statusCounts[id] = { totalUserCount, deliveredCount, seenCount };
        });

        builder.addCase(sendFileMessage.fulfilled, (state, { payload }) => {
            const { message } = payload;
            const {
                id,
                roomId,
                localId,
                messageRecords,
                totalUserCount,
                deliveredCount,
                seenCount,
            } = message;

            const room = state[roomId];

            delete room.messages[localId];
            room.messages[id] = message;
            room.reactions[id] = messageRecords || [];
            room.statusCounts[id] = { totalUserCount, deliveredCount, seenCount };
        });

        builder.addCase(replyMessageThunk.fulfilled, (state, { payload }) => {
            const { message } = payload;
            const {
                id,
                roomId,
                localId,
                messageRecords,
                totalUserCount,
                deliveredCount,
                seenCount,
            } = message;

            const room = state[roomId];

            delete room.messages[localId];
            room.messages[id] = message;
            room.reactions[id] = messageRecords || [];
            room.statusCounts[id] = { totalUserCount, deliveredCount, seenCount };
        });
    },
});

export const {
    setSending,
    addMessage,
    addMessageRecord,
    showMessageDetails,
    hideMessageDetails,
    showDeleteModal,
    hideDeleteModal,
    deleteMessage,
    editMessage,
} = messagesSlice.actions;

export const selectRoomMessages =
    (roomId: number) =>
    (
        state: RootState
    ): {
        [id: string]: MessageType;
    } => {
        return state.messages[roomId]?.messages || {};
    };

export const selectRoomMessagesLength =
    (roomId: number) =>
    (state: RootState): number => {
        return Object.keys(state.messages[roomId]?.messages || {}).length;
    };
export const selectRoomMessagesIsLoading =
    (roomId: number) =>
    (state: RootState): boolean => {
        return state.messages[roomId]?.loading;
    };

export const canLoadMoreMessages =
    (roomId: number) =>
    (state: RootState): boolean => {
        const room = state.messages[roomId];

        if (!room) {
            return true;
        }

        if (room.loading) {
            return false;
        }

        if (room.count && !room.cursor) {
            return false;
        }

        return true;
    };

export const selectMessageById =
    (roomId: number, id: number) =>
    (state: RootState): MessageType | null => {
        const room = state.messages[roomId];

        if (!room) {
            return null;
        }

        const message = room.messages[id];

        if (!message) {
            return null;
        }

        return message;
    };

export const selectMessageReactions =
    (roomId: number, id: number) =>
    (state: RootState): MessageRecordType[] => {
        const room = state.messages[roomId];

        if (!room) {
            return null;
        }

        return room.reactions[id] || [];
    };

export const selectHasMessageReactions =
    (roomId: number, id: number) =>
    (state: RootState): boolean => {
        const room = state.messages[roomId];

        if (!room || !room.reactions[id]) {
            return false;
        }

        return !!room.reactions[id].length;
    };

export const selectMessageStatus =
    (roomId: number, id: number) =>
    (state: RootState): string => {
        const room = state.messages[roomId];

        if (!room) {
            return "";
        }

        if (room.messages[id].status) {
            return room.messages[id].status;
        }

        if (room.statusCounts[id]) {
            return getMessageStatus(room.statusCounts[id]);
        }

        return "";
    };

export const selectShowMessageDetails =
    (roomId: number) =>
    (state: RootState): boolean => {
        const room = state.messages[roomId];

        if (!room) {
            return false;
        }

        return room.showDetails;
    };

export const selectShowDeleteMessage =
    (roomId: number) =>
    (state: RootState): boolean => {
        const room = state.messages[roomId];

        if (!room) {
            return false;
        }

        return room.showDelete;
    };

export const selectActiveMessage =
    (roomId: number) =>
    (state: RootState): MessageType | null => {
        const room = state.messages[roomId];

        if (!room) {
            return null;
        }

        if (!room.activeMessageId) {
            return null;
        }

        return room.messages[room.activeMessageId] || null;
    };

export const selectCursor =
    (roomId: number) =>
    (state: RootState): number => {
        const room = state.messages[roomId];

        return room?.cursor;
    };

export const selectIsLastMessageFromUser =
    (roomId: number) =>
    (state: RootState): boolean => {
        const room = state.messages[roomId];
        const userId = state.user.id;

        if (!room) {
            return false;
        }

        const messages = Object.values(room.messages || {});

        if (!messages || !messages.length) {
            return false;
        }

        const sortedMessages = messages.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

        return sortedMessages[0].fromUserId === userId;
    };

export const selectShouldDisplayBlockButton =
    (roomId: number) =>
    (state: RootState): boolean => {
        const room = state.messages[roomId];
        const roomData = state.api.queries[`getRoom(${roomId})`]?.data as RoomType;
        const roomBlockData = state.api.queries[`getRoomBlocked(${roomId})`]?.data as {
            id: number;
        };

        if (roomBlockData) {
            return false;
        }

        if (!room || !roomData) {
            return false;
        }

        const allMessagesLoaded = room.cursor === null;
        const noUserMessages = Object.values(room.messages || {}).every(
            (m) => m.fromUserId !== state.user.id
        );

        return allMessagesLoaded && noUserMessages && roomData.type === "private";
    };

export const selectOtherUserIdInPrivateRoom =
    (roomId: number) =>
    (state: RootState): number => {
        const roomData = state.api.queries[`getRoom(${roomId})`]?.data as RoomType;

        if (!roomData) {
            return null;
        }

        if (roomData.type !== "private") {
            return null;
        }

        const otherUser = roomData.users.find((m) => m.userId !== state.user.id);

        return otherUser?.userId;
    };

export default messagesSlice.reducer;
