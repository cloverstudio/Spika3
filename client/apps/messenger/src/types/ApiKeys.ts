import { ApiKey } from ".prisma/client";

type ApiKeyType = Omit<ApiKey, "modifiedAt" | "createdAt"> & {
    createdAt: number;
    modifiedAt: number;
};

export default ApiKeyType;
