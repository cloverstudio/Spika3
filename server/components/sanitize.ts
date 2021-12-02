export default function sanitize(modelName: string, data: any): any {
    switch (modelName) {
        case "user": {
            return sanitizeUser(data);
        }

        default: {
            throw new Error("Unknown sanitize modelName");
        }
    }
}

function sanitizeUser(data: any) {
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
}
