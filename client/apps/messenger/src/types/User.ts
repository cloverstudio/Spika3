import { User } from ".prisma/client";

type UserType = Partial<
    Omit<User, "createdAt" | "modifiedAt" | "dob"> & {
        createdAt: number;
        modifiedAt: number;
        dob: number;
    }
>;

export type UpdateUserFormType = {
    firstName: string;
    lastName: string;
    country: string;
    gender: string;
    city: string;
    dob: string;
    email: string;
    telephoneNumber?: string;
    avatarUrl?: string;
};

export default UserType;
