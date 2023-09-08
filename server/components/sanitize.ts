import {
    Room,
    User,
    Device,
    Message,
    RoomUser,
    File,
    MessageRecord,
    Note,
    Webhook,
    ApiKey,
    Block,
} from ".prisma/client";

type SanitizedUserType = Partial<
    Omit<User, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedDeviceType = Partial<Omit<Device, "tokenExpiredAt"> & { tokenExpiredAt?: number }>;
type SanitizedRoomUserType = {
    isAdmin: boolean;
    userId: number;
    roomId: number;
    createdAt: number;
    user: SanitizedUserType;
};
export type SanitizedRoomType = Partial<
    Omit<Room, "users" | "createdAt" | "modifiedAt"> & {
        createdAt: number;
        modifiedAt: number;
        unreadCount?: number;
        users: SanitizedRoomUserType[];
        muted: boolean;
        pinned: boolean;
    }
>;
type SanitizedMessageType = Partial<
    Omit<Message, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number; body: any }
>;
type SanitizedMessageWithReactionRecordsType = Partial<
    Omit<Message, "createdAt" | "modifiedAt"> & {
        createdAt: number;
        modifiedAt: number;
        body: any;
        messageRecords: SanitizedMessageRecord[];
    }
>;
type SanitizedFileType = Partial<Omit<File, "createdAt"> & { createdAt: number }>;
export type SanitizedMessageRecord = Partial<
    Omit<MessageRecord, "createdAt" | "modifiedAt"> & { createdAt: number; roomId?: number }
>;
export type SanitizedMessageRecordWithMessage = Partial<
    Omit<MessageRecord, "createdAt" | "modifiedAt"> & {
        createdAt: number;
        roomId?: number;
        message: SanitizedMessageType;
    }
>;
type SanitizedNoteType = Partial<
    Omit<Note, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedWebhookType = Partial<
    Omit<Webhook, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedApiKeyType = Partial<
    Omit<ApiKey, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedBlockType = Partial<Omit<Block, "createdAt"> & { createdAt: number }>;

interface sanitizeTypes {
    user: () => SanitizedUserType;
    device: () => SanitizedDeviceType;
    room: () => SanitizedRoomType;
    message: () => SanitizedMessageType;
    messageWithReactionRecords: () => SanitizedMessageWithReactionRecordsType;
    file: () => SanitizedFileType;
    messageRecord: () => SanitizedMessageRecord;
    messageRecordWithMessage: () => SanitizedMessageRecordWithMessage;
    note: () => SanitizedNoteType;
    webhook: () => SanitizedWebhookType;
    apiKey: () => SanitizedApiKeyType;
    block: () => SanitizedBlockType;
}

export default function sanitize(data: any): sanitizeTypes {
    return {
        user: () => sanitizeUser(data),
        room: () => sanitizeRoom(data),
        device: () => {
            const {
                id,
                userId,
                token,
                tokenExpiredAt,
                osName,
                osVersion,
                appVersion,
                pushToken,
                deviceId,
                deviceName,
                type,
            } = data as Device;

            return {
                id,
                userId,
                token,
                tokenExpiredAt: tokenExpiredAt ? +new Date(tokenExpiredAt) : null,
                osName,
                osVersion,
                appVersion,
                pushToken,
                deviceId,
                deviceName,
                type,
            };
        },
        message: () => {
            const {
                id,
                fromUserId,
                totalUserCount,
                deliveredCount,
                seenCount,
                roomId,
                type,
                body,
                createdAt,
                modifiedAt,
                localId,
                deleted,
                replyId,
            } = data as Message & { body: any };

            return {
                id,
                roomId,
                fromUserId,
                totalUserCount,
                deliveredCount,
                seenCount,
                type,
                body,
                createdAt: +new Date(createdAt),
                modifiedAt: +new Date(modifiedAt),
                localId,
                replyId,
                deleted,
            };
        },
        messageWithReactionRecords: () => {
            const {
                id,
                fromUserId,
                totalUserCount,
                deliveredCount,
                seenCount,
                roomId,
                type,
                body,
                createdAt,
                modifiedAt,
                localId,
                deleted,
                replyId,
                messageRecords,
            } = data as Message & { body: any; messageRecords: MessageRecord[] };

            return {
                id,
                fromUserId,
                totalUserCount,
                deliveredCount,
                seenCount,
                roomId,
                type,
                body,
                createdAt: +new Date(createdAt),
                modifiedAt: +new Date(modifiedAt),
                localId,
                deleted,
                messageRecords: messageRecords
                    .filter((m) => m.type === "reaction")
                    .map(
                        ({
                            id,
                            type,
                            messageId,
                            userId,
                            createdAt,
                            modifiedAt,
                            reaction,
                            isDeleted,
                        }) => ({
                            id,
                            type,
                            messageId,
                            userId,
                            reaction,
                            roomId,
                            createdAt: +new Date(createdAt),
                            isDeleted,
                            modifiedAt: +new Date(modifiedAt),
                        })
                    ),
                replyId,
            };
        },
        file: () => {
            const {
                id,
                fileName,
                size,
                mimeType,
                type,
                relationId,
                clientId,
                path,
                createdAt,
                metaData,
            } = data as File;

            return {
                id,
                fileName,
                size,
                mimeType,
                type,
                relationId,
                clientId,
                path,
                metaData,
                createdAt: +new Date(createdAt),
            };
        },
        messageRecord: () => {
            const {
                id,
                type,
                messageId,
                userId,
                createdAt,
                reaction,
                roomId,
                modifiedAt,
                isDeleted,
            } = data as MessageRecord & { roomId?: number };

            return {
                id,
                type,
                messageId,
                userId,
                reaction,
                roomId,
                createdAt: +new Date(createdAt),
                isDeleted,
                modifiedAt: +new Date(modifiedAt),
            };
        },
        messageRecordWithMessage: () => {
            const {
                id,
                type,
                messageId,
                userId,
                createdAt,
                reaction,
                roomId,
                message,
                modifiedAt,
                isDeleted,
            } = data as MessageRecord & { roomId?: number; message: SanitizedMessageType };

            return {
                id,
                type,
                messageId,
                userId,
                reaction,
                roomId,
                createdAt: +new Date(createdAt),
                message,
                isDeleted,
                modifiedAt: +new Date(modifiedAt),
            };
        },
        note: () => {
            const { id, title, content, createdAt, modifiedAt, roomId } = data as Note;

            return {
                id,
                title,
                content,
                roomId,
                createdAt: +new Date(createdAt),
                modifiedAt: +new Date(modifiedAt),
            };
        },
        webhook: () => {
            const { id, url, verifySignature, createdAt, modifiedAt, roomId } = data as Webhook;

            return {
                id,
                url,
                verifySignature,
                roomId,
                createdAt: +new Date(createdAt),
                modifiedAt: +new Date(modifiedAt),
            };
        },
        apiKey: () => {
            const { id, displayName, token, avatarFileId, createdAt, modifiedAt, roomId } =
                data as ApiKey & { displayName: string; avatarFileId?: number };

            return {
                id,
                displayName,
                token,
                avatarFileId,
                roomId,
                createdAt: +new Date(createdAt),
                modifiedAt: +new Date(modifiedAt),
            };
        },
        block: () => {
            const { id, createdAt, blockedId, userId } = data as Block;

            return {
                id,
                blockedId,
                userId,
                createdAt: +new Date(createdAt),
            };
        },
    };
}

function sanitizeUser({
    id,
    emailAddress,
    telephoneNumber,
    telephoneNumberHashed,
    displayName,
    avatarFileId,
    verified,
    createdAt,
    modifiedAt,
    isBot,
    deleted,
}: Partial<User>): SanitizedUserType {
    return {
        id,
        displayName,
        avatarFileId,
        telephoneNumber,
        telephoneNumberHashed,
        emailAddress,
        verified,
        createdAt: +new Date(createdAt),
        modifiedAt: +new Date(modifiedAt),
        isBot,
        deleted,
    };
}

function sanitizeRoom({
    id,
    type,
    name,
    avatarFileId,
    users,
    createdAt,
    modifiedAt,
    deleted,
    muted,
    pinned,
    unreadCount,
}: Partial<
    Room & {
        users: (RoomUser & { user: User })[];
        muted: boolean;
        pinned: boolean;
        unreadCount?: number;
    }
>): SanitizedRoomType {
    return {
        id,
        name,
        users: users.map(sanitizeRoomUser),
        avatarFileId,
        muted,
        type,
        deleted,
        pinned,
        createdAt: +new Date(createdAt),
        modifiedAt: +new Date(modifiedAt),
        unreadCount,
    };
}

function sanitizeRoomUser({
    userId,
    isAdmin,
    roomId,
    createdAt,
    user,
}: Partial<RoomUser & { user?: User }>): SanitizedRoomUserType {
    return {
        userId,
        isAdmin,
        roomId,
        createdAt: +new Date(createdAt),
        ...(user && { user: sanitizeUser(user) }),
    };
}
