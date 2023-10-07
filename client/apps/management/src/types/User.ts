import { User, Device } from ".prisma/client";

type UserType = Partial<
    Omit<User, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;

export type BotUserType = Partial<
    Omit<User, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number, device: Device[] }
>;


export default UserType;
