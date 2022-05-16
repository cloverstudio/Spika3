import { Room, User, Device, Message, RoomUser, File, MessageRecord } from ".prisma/client";

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
    Omit<Room, "users" | "createdAt"> & { createdAt: number; users: SanitizedRoomUserType[] }
>;
type SanitizedMessageType = Partial<Omit<Message, "createdAt"> & { createdAt: number; body: any }>;
type SanitizedFileType = Partial<Omit<File, "createdAt"> & { createdAt: number }>;
export type SanitizedMessageRecord = Partial<
    Omit<MessageRecord, "createdAt" | "modifiedAt"> & { createdAt: number }
>;

interface sanitizeTypes {
    user: () => SanitizedUserType;
    device: () => SanitizedDeviceType;
    room: () => SanitizedRoomType;
    message: () => SanitizedMessageType;
    file: () => SanitizedFileType;
    messageRecord: () => SanitizedMessageRecord;
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
                localId,
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
                localId,
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
            const { id, type, messageId, userId, createdAt } = data as MessageRecord;

            return {
                id,
                type,
                messageId,
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
    avatarUrl,
    createdAt,
}: Partial<User>): SanitizedUserType {
    return {
        id,
        emailAddress,
        telephoneNumber,
        telephoneNumberHashed,
        displayName,
        avatarUrl,
        createdAt: +new Date(createdAt),
    };
}

function sanitizeRoom({
    id,
    type,
    name,
    avatarUrl,
    users,
    createdAt,
}: Partial<Room & { users: (RoomUser & { user: User })[] }>): SanitizedRoomType {
    return {
        id,
        type,
        name,
        avatarUrl,
        users: users.map(sanitizeRoomUser),
        createdAt: +new Date(createdAt),
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
