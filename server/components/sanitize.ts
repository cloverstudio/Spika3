import { Room, User } from ".prisma/client";

interface sanitizeTypes {
    user: () => Partial<User>;
    room: () => Partial<Room & { users: Partial<User>[] }>;
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
                createdAt,
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
                createdAt,
            };
        },
    };
}
