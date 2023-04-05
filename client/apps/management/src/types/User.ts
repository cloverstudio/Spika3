import { User } from ".prisma/client";

type UserType = Partial<
    Omit<User, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;

export default UserType;
