import { PrismaClient, User, Device, Room } from "@prisma/client";
import amqp from "amqplib";
import { createClient } from "redis";

const prisma = new PrismaClient();

export interface Globals {
    adminToken: string;
    createdUser: User | undefined;
    createdDevice: Device | undefined;
    deviceId: number | undefined;
    telephoneNumber: string | undefined;
    userToken: string | undefined;
    userId?: number | undefined;
    roomId?: number | undefined;
    prisma: PrismaClient;
    createdRoom: Room;
    rabbitMQChannel?: amqp.Channel;
    redisClient?: ReturnType<typeof createClient>;
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
