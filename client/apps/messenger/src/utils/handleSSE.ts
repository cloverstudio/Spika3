import api, { dynamicBaseQuery } from "../api/api";

import { refreshHistory, removeRoom } from "../features/room/slices/leftSidebar";
import { RootState, store } from "../store/store";

const VALID_SSE_EVENT_TYPES = [
    "NEW_MESSAGE_RECORD",
    "NEW_MESSAGE",
    "DELETE_MESSAGE",
    "UPDATE_MESSAGE",
    "CALL_JOIN",
    "CALL_LEAVE",
    "CALL_UPDATE",
    "UPDATE_ROOM",
    "DELETE_ROOM",
    "USER_UPDATE",
    "SEEN_ROOM",
    "REMOVED_FROM_ROOM",
    "DELETE_MESSAGE_RECORD",
];

import { notify as notifyCallEvent } from "../features/confcall/lib/callEventListener";
import { fetchContacts } from "../features/room/slices/contacts";
import { RoomType } from "../types/Rooms";
import {
    addMessage,
    addMessageRecord,
    deleteMessage,
    editMessage,
    removeMessageRecord,
} from "../features/room/slices/messages";
import UserType from "../types/User";

export default async function handleSSE(event: MessageEvent): Promise<void> {
    const data = event.data ? JSON.parse(event.data) : {};

    if (!data || !data?.type) {
        return;
    }

    const eventType = data.type;
    const eventTypeIsImplemented = VALID_SSE_EVENT_TYPES.includes(eventType);

    if (!eventTypeIsImplemented) {
        console.log(`Received SSE (${eventType}) that is not implemented yet!`);
        return;
    }

    switch (eventType) {
        case "NEW_MESSAGE": {
            const message = data.message;
            if (!message) {
                console.log("Invalid NEW_MESSAGE payload");
                return;
            }

            store.dispatch(addMessage(message));

            const userIsInRoom = document.URL.includes(`/rooms/${message.roomId}`);
            const hidden = document.visibilityState === "hidden";

            if (hidden || !userIsInRoom) {
                store.dispatch(api.util.invalidateTags([{ type: "UnreadCount" }]));
                await dynamicBaseQuery({
                    url: "/messenger/messages/delivered",
                    method: "POST",
                    data: { messageIds: [message.id] },
                });
            } else {
                await dynamicBaseQuery({
                    url: `/messenger/messages/${message.roomId}/seen`,
                    method: "POST",
                });
            }

            store.dispatch(refreshHistory(message.roomId as number));

            const queries = (store.getState() as RootState).api.queries;
            let isMuted = false;

            if (queries) {
                const getRoomQueries = Object.entries(queries)
                    .filter(([key]) => key.startsWith("getRoom("))
                    .map(([_, val]) => val);

                const getRoomQueryData = getRoomQueries.find(
                    (q) => q.originalArgs === message.roomId,
                ).data as RoomType;

                isMuted = getRoomQueryData.muted;
            }

            // play sound logic

            if (isMuted || !hidden || message.fromUserId === store.getState().user.id) {
                return;
            }

            return;
        }

        case "NEW_MESSAGE_RECORD": {
            const { messageRecord, seenCount, deliveredCount } = data;
            if (!messageRecord) {
                console.log("Invalid NEW_MESSAGE_RECORD payload");
                return;
            }

            store.dispatch(addMessageRecord({ messageRecord, seenCount, deliveredCount }));

            return;
        }

        case "DELETE_MESSAGE_RECORD": {
            const { messageRecord } = data;
            if (!messageRecord) {
                console.log("Invalid DELETE_MESSAGE_RECORD payload");
                return;
            }

            store.dispatch(removeMessageRecord({ messageRecord }));

            return;
        }

        case "DELETE_MESSAGE": {
            const message = data.message;
            if (!message) {
                console.log("Invalid DELETE_MESSAGE payload");
                return;
            }

            store.dispatch(deleteMessage(message));
            store.dispatch(refreshHistory(message.roomId as number));

            return;
        }

        case "UPDATE_MESSAGE": {
            const message = data.message;
            if (!message) {
                console.log("Invalid UPDATE_MESSAGE payload");
                return;
            }

            store.dispatch(editMessage(message));
            store.dispatch(refreshHistory(message.roomId as number));

            return;
        }

        case "CALL_JOIN": {
            notifyCallEvent(data);

            return;
        }

        case "CALL_LEAVE": {
            notifyCallEvent(data);

            return;
        }

        case "CALL_UPDATE": {
            notifyCallEvent(data);

            return;
        }

        case "UPDATE_ROOM": {
            const room = data.room;

            if (!room) {
                console.log("Invalid UPDATE_ROOM payload");
                return;
            }

            store.dispatch(api.util.invalidateTags([{ type: "Rooms", id: room.id }]));
            return;
        }

        case "USER_UPDATE": {
            const user = data.user;

            if (!user) {
                console.log("Invalid USER_UPDATE payload");

                return;
            }

            store.dispatch(fetchContacts());
            const queries = (store.getState() as RootState).api.queries;

            if (!queries) {
                return;
            }

            const getRoomQueries = Object.entries(queries)
                .filter(
                    ([key, val]) =>
                        key.startsWith("getRoom(") &&
                        val?.data &&
                        (val.data as RoomType).users.find((u) => u.userId === user.id),
                )
                .map(([_, val]) => val);

            if (getRoomQueries.length) {
                for (const query of getRoomQueries) {
                    store.dispatch(
                        api.util.invalidateTags([
                            { type: "Rooms", id: query.originalArgs as number },
                        ]),
                    );
                }
            }

            const getUserQueries = Object.entries(queries)
                .filter(
                    ([key, val]) =>
                        key.startsWith("getUser(") &&
                        typeof val.data === "object" &&
                        "user" in val?.data &&
                        (val.data.user as UserType).id === user.id,
                )
                .map(([_, val]) => val);

            if (getUserQueries.length) {
                for (const query of getUserQueries) {
                    store.dispatch(api.util.invalidateTags([{ type: "Auth", id: "me" }]));
                }
            }

            return;
        }

        case "DELETE_ROOM": {
            const room = data.room;

            if (!room) {
                console.log("Invalid DELETE_ROOM payload");
                return;
            }

            store.dispatch(removeRoom(room.id as number));
            store.dispatch(api.util.invalidateTags([{ type: "Rooms", id: room.id }]));
            store.dispatch(api.util.invalidateTags([{ type: "UnreadCount" }]));

            return;
        }

        case "SEEN_ROOM": {
            const roomId = data.roomId;

            if (!roomId) {
                console.log("Invalid SEEN_ROOM payload");
                return;
            }

            store.dispatch(api.util.invalidateTags([{ type: "Rooms", id: roomId }]));
            store.dispatch(refreshHistory(roomId as number));
            store.dispatch(api.util.invalidateTags([{ type: "UnreadCount" }]));

            return;
        }

        case "REMOVED_FROM_ROOM": {
            const roomId = data.roomId;

            if (!roomId) {
                console.log("Invalid REMOVED_FROM_ROOM payload");
                return;
            }

            store.dispatch(api.util.invalidateTags([{ type: "Rooms", id: roomId }]));
            store.dispatch(removeRoom(roomId as number));
            store.dispatch(api.util.invalidateTags([{ type: "UnreadCount" }]));

            return;
        }

        default:
            break;
    }
}
