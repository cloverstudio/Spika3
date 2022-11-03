import { ApiKey } from ".prisma/client";

type ApiKeyType = Omit<ApiKey, "modifiedAt" | "createdAt"> & {
    displayName: string;
    createdAt: number;
    modifiedAt: number;
};

export default ApiKeyType;
