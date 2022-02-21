import { Room, User, Device, Message, RoomUser } from ".prisma/client";

type SanitizedUserType = Partial<
    Omit<User, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedDeviceType = Partial<Omit<Device, "tokenExpiredAt"> & { tokenExpiredAt?: number }>;
type SanitizedRoomUserType = {
    isAdmin: boolean;
    userId: number;
    user: SanitizedUserType;
};
type SanitizedRoomType = Partial<
    Omit<Room, "users" | "createdAt"> & { createdAt: number; users: SanitizedRoomUserType[] }
>;
type SanitizedMessageType = Partial<
    Omit<Message, "createdAt"> & { createdAt: number; messageBody: any }
>;

interface sanitizeTypes {
    user: () => SanitizedUserType;
    device: () => SanitizedDeviceType;
    room: () => SanitizedRoomType;
    message: () => SanitizedMessageType;
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
                fromDeviceId,
                fromUserId,
                totalDeviceCount,
                receivedCount,
                seenCount,
                roomId,
                type,
                messageBody,
                createdAt,
            } = data as Message & { messageBody: any };

            return {
                id,
                fromDeviceId,
                fromUserId,
                totalDeviceCount,
                receivedCount,
                seenCount,
                roomId,
                type,
                messageBody,
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
}: Partial<RoomUser & { user: User }>): SanitizedRoomUserType {
    return {
        userId,
        isAdmin,
        user: sanitizeUser(user),
    };
}
