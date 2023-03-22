import { User } from ".prisma/client";

type UserType = Partial<
    Omit<User, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;

export default UserType;

export type UserListType = {
    list: UserType[];
    count: number;
    limit: number;
};
