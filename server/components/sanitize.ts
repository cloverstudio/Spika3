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
type SanitizedFileType = Partial<Omit<File, "createdAt"> & { createdAt: number }>;
export type SanitizedMessageRecord = Partial<
    Omit<MessageRecord, "createdAt" | "modifiedAt"> & { createdAt: number }
>;
type SanitizedNoteType = Partial<
    Omit<Note, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedWebhookType = Partial<
    Omit<Webhook, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;

interface sanitizeTypes {
    user: () => SanitizedUserType;
    device: () => SanitizedDeviceType;
    room: () => SanitizedRoomType;
    message: () => SanitizedMessageType;
    file: () => SanitizedFileType;
    messageRecord: () => SanitizedMessageRecord;
    note: () => SanitizedNoteType;
    webhook: () => SanitizedWebhookType;
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
                messageRecords: data.messageRecords?.filter((m) => m.type === "reaction"),
            };
        },
        file: () => {
            const { id, fileName, size, mimeType, type, relationId, clientId, path, createdAt } =
                data as File;

            return {
                id,
                fileName,
                size,
                mimeType,
                type,
                relationId,
                clientId,
                path,
                createdAt: +new Date(createdAt),
            };
        },
        messageRecord: () => {
            const { id, type, messageId, userId, createdAt, reaction } = data as MessageRecord;

            return {
                id,
                type,
                messageId,
                userId,
                reaction,
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
    };
}

function sanitizeUser({
    id,
    emailAddress,
    telephoneNumber,
    telephoneNumberHashed,
    displayName,
    avatarUrl,
    verified,
    createdAt,
    modifiedAt,
}: Partial<User>): SanitizedUserType {
    return {
        id,
        emailAddress,
        telephoneNumber,
        telephoneNumberHashed,
        displayName,
        avatarUrl,
        verified,
        createdAt: +new Date(createdAt),
        modifiedAt: +new Date(modifiedAt),
    };
}

function sanitizeRoom({
    id,
    type,
    name,
    avatarUrl,
    users,
    createdAt,
    modifiedAt,
}: Partial<Room & { users: (RoomUser & { user: User })[] }>): SanitizedRoomType {
    return {
        id,
        type,
        name,
        avatarUrl,
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
