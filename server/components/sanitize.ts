import { Device, User } from ".prisma/client";

interface sanitizeTypes {
    user: () => Partial<User>;
    device: () => Partial<Device>;
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
        device: () => {
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
    };
}
