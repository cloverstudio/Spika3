import { PrismaClient, User, Device } from "@prisma/client";
const prisma = new PrismaClient();

export interface Globals {
    adminToken: string;
    createdUser: User | undefined;
    createdDevice: Device | undefined;
    deviceId: string | undefined;
    telephoneNumber: string | undefined;
    userToken: string | undefined;
    userId?: number | undefined;
    prisma: PrismaClient;
}

const globals: Globals = {
    adminToken: "",
    createdUser: undefined,
    createdDevice: undefined,
    telephoneNumber: undefined,
    deviceId: undefined,
    userToken: "",
    prisma,
};

export default globals;
