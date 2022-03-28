import { PrismaClient, User, Device, Room } from "@prisma/client";
import amqp from "amqplib";

const prisma = new PrismaClient();

export interface Globals {
    adminToken: string;
    createdUser: User | undefined;
    createdDevice: Device | undefined;
    deviceId: number | undefined;
    telephoneNumber: string | undefined;
    userToken: string | undefined;
    userId?: number | undefined;
    prisma: PrismaClient;
    createdRoom: Room;
    rabbitMQChannel?: amqp.Channel;
}

const globals: Globals = {
    adminToken: "",
    createdUser: undefined,
    createdDevice: undefined,
    telephoneNumber: undefined,
    deviceId: undefined,
    userToken: "",
    prisma,
    createdRoom: undefined,
};

export default globals;
