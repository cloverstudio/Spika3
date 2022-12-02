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
} from ".prisma/client";

type SanitizedUserType = Partial<
    Omit<User, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedDeviceType = Partial<Omit<Device, "tokenExpiredAt"> & { tokenExpiredAt?: number }>;
type SanitizedRoomUserType = {
    isAdmin: boolean;
    userId: number;
    user: SanitizedUserType;
};
export type SanitizedRoomType = Partial<
    Omit<Room, "users" | "createdAt" | "modifiedAt"> & {
        createdAt: number;
        modifiedAt: number;
        users: SanitizedRoomUserType[];
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
type SanitizedNoteType = Partial<
    Omit<Note, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedWebhookType = Partial<
    Omit<Webhook, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedApiKeyType = Partial<
    Omit<ApiKey, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;

interface sanitizeTypes {
    user: () => SanitizedUserType;
    device: () => SanitizedDeviceType;
    room: () => SanitizedRoomType;
    message: () => SanitizedMessageType;
    messageWithReactionRecords: () => SanitizedMessageWithReactionRecordsType;
    file: () => SanitizedFileType;
    messageRecord: () => SanitizedMessageRecord;
    note: () => SanitizedNoteType;
    webhook: () => SanitizedWebhookType;
    apiKey: () => SanitizedApiKeyType;
}

export default function sanitize(data: any): sanitizeTypes {
    return {
        user: () => sanitizeUser(data),
        room: () => sanitizeRoom(data),
        device: () => {
            const { id, userId, token, tokenExpiredAt, osName, osVersion, appVersion, pushToken } =
                data as Device;

            return {
                id,
                userId,
                token,
                tokenExpiredAt: tokenExpiredAt ? +new Date(tokenExpiredAt) : null,
                osName,
                osVersion,
                appVersion,
                pushToken,
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
                reply,
            } = data as Message & { body: any };

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
                reply,
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
                reply,
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
                reply,
                messageRecords: messageRecords
                    .filter((m) => m.type === "reaction")
                    .map(({ id, type, messageId, userId, createdAt, reaction }) => ({
                        id,
                        type,
                        messageId,
                        userId,
                        reaction,
                        roomId,
                        createdAt: +new Date(createdAt),
                    })),
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
            const { id, type, messageId, userId, createdAt, reaction, roomId } =
                data as MessageRecord & { roomId?: number };

            return {
                id,
                type,
                messageId,
                userId,
                reaction,
                roomId,
                createdAt: +new Date(createdAt),
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
            const { id, displayName, token, avatarUrl, createdAt, modifiedAt, roomId } =
                data as ApiKey & { displayName: string; avatarUrl?: string };

            return {
                id,
                displayName,
                token,
                avatarUrl,
                roomId,
                createdAt: +new Date(createdAt),
                modifiedAt: +new Date(modifiedAt),
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
    avatarUrl,
    verified,
    createdAt,
    modifiedAt,
    isBot,
}: Partial<User>): SanitizedUserType {
    return {
        id,
        emailAddress,
        telephoneNumber,
        telephoneNumberHashed,
        displayName,
        avatarUrl,
        avatarFileId,
        verified,
        createdAt: +new Date(createdAt),
        modifiedAt: +new Date(modifiedAt),
        isBot,
    };
}

function sanitizeRoom({
    id,
    type,
    name,
    avatarUrl,
    avatarFileId,
    users,
    createdAt,
    modifiedAt,
    deleted,
}: Partial<Room & { users: (RoomUser & { user: User })[] }>): SanitizedRoomType {
    return {
        id,
        type,
        name,
        avatarUrl,
        avatarFileId,
        deleted,
        users: users.map(sanitizeRoomUser),
        createdAt: +new Date(createdAt),
        modifiedAt: +new Date(modifiedAt),
    };
}

function sanitizeRoomUser({
    userId,
    isAdmin,
    user,
}: Partial<RoomUser & { user?: User }>): SanitizedRoomUserType {
    return {
        userId,
        isAdmin,
        ...(user && { user: sanitizeUser(user) }),
    };
}
