import { Room, User, Device, Message } from ".prisma/client";

type SanitizedUserType = Partial<
    Omit<User, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;
type SanitizedDeviceType = Partial<Omit<Device, "tokenExpiredAt"> & { tokenExpiredAt?: number }>;
type SanitizedRoomType = Partial<
    Omit<Room, "users" | "createdAt"> & { createdAt: number; users: SanitizedUserType[] }
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
        user: () => {
            const {
                id,
                emailAddress,
                telephoneNumber,
                telephoneNumberHashed,
                displayName,
                avatarUrl,
                createdAt,
            } = data;

            return {
                id,
                emailAddress,
                telephoneNumber,
                telephoneNumberHashed,
                displayName,
                avatarUrl,
                createdAt: +new Date(createdAt),
            };
        },
        room: () => {
            const { id, type, name, avatarUrl, users, createdAt } = data;

            return {
                id,
                type,
                name,
                avatarUrl,
                users,
                createdAt: +new Date(createdAt),
            };
        },
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
