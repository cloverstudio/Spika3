import { Room, User } from "@prisma/client";
import prisma from "../prisma";
import amqp from "amqplib";
import * as Constants from "../consts";
import sanitize from "../sanitize";

export default class AgentBase {
    name: string;
    agentUser: User;
    enabled: boolean;

    constructor() {
        this.name = "";
    }

    async createOrLoad() {
        if (this.name == "") {
            return;
        }

        this.agentUser = await prisma.user.findFirst({
            where: {
                displayName: this.name,
                verified: true,
                isBot: true,
            },
        });

        if (!this.agentUser) {
            this.agentUser = await prisma.user.create({
                data: {
                    displayName: this.name,
                    verified: true,
                    isBot: true,
                    deleted: !this.enabled
                },
            });
        }else{
            const existedUser = await prisma.user.findFirst({
                where:{
                    displayName: this.name,
                }
            })
            existedUser && 
                await prisma.user.update({
                    where: { id: existedUser.id },
                    data: { deleted: !this.enabled },
                })
        }
    }

    async createContact({ userId }: { userId: number }) {
        const contact = await prisma.contact.findFirst({
            where: {
                userId: userId,
                contactId: this.agentUser.id,
            },
        });

        if (!contact) {
            await prisma.contact.create({
                data: {
                    userId: userId,
                    contactId: this.agentUser.id,
                },
            });
        }

        return contact;
    }

    async handleNewRoom({
        users,
        room,
        rabbitMQChannel,
    }: {
        users: User[];
        room: Room;
        rabbitMQChannel: amqp.Channel;
    }) {
        if (room.type !== "private") {
            return;
        }

        const isMyChat = users.find((u) => u.displayName === this.agentUser.displayName);

        if (!isMyChat) {
            return;
        }

        let responseText: string;

        try {
            responseText = await this.helloMessage();
        } catch (error) {
            console.log({ error });
            responseText = "Error ocurred, please try again latter!";
        }

        await this.sendMessage({
            fromUser: this.agentUser,
            users,
            body: { text: responseText },
            rabbitMQChannel,
            roomId: room.id,
        });
    }

    async sendMessage({
        fromUser,
        users,
        body,
        rabbitMQChannel,
        roomId,
    }: {
        fromUser: User;
        users: User[];
        body: any;
        rabbitMQChannel: amqp.Channel;
        roomId: number;
    }) {
        const devices = await prisma.device.findMany({
            where: {
                userId: { in: users.map((u) => u.id) },
            },
        });

        const deviceMessages = devices.map((device) => ({
            deviceId: device.id,
            userId: device.userId,
            fromUserId: fromUser.id,
            body,
            action: Constants.MESSAGE_ACTION_NEW_MESSAGE,
        }));

        const message = await prisma.message.create({
            data: {
                type: "text",
                roomId,
                fromUserId: fromUser.id,
                totalUserCount: 2,
                deliveredCount: 0,
                seenCount: 0,
            },
        });

        const sanitizedMessage = sanitize({
            ...message,
            body,
        }).message();

        while (deviceMessages.length) {
            await Promise.all(
                deviceMessages.splice(0, 10).map(async (deviceMessage) => {
                    await prisma.deviceMessage.create({
                        data: { ...deviceMessage, messageId: message.id },
                    });

                    rabbitMQChannel.sendToQueue(
                        Constants.QUEUE_PUSH,
                        Buffer.from(
                            JSON.stringify({
                                type: Constants.PUSH_TYPE_NEW_MESSAGE,
                                token: devices.find((d) => d.id == deviceMessage.deviceId)
                                    ?.pushToken,
                                data: {
                                    message: sanitizedMessage,
                                    user: sanitize(fromUser).user(),
                                    toUserId: deviceMessage.userId,
                                },
                            })
                        )
                    );

                    rabbitMQChannel.sendToQueue(
                        Constants.QUEUE_SSE,
                        Buffer.from(
                            JSON.stringify({
                                channelId: deviceMessage.deviceId,
                                data: {
                                    type: Constants.PUSH_TYPE_NEW_MESSAGE,
                                    message: sanitizedMessage,
                                },
                            })
                        )
                    );
                })
            );
        }
    }

    async handleNewMessage({
        body,
        fromUserId,
        users,
        room,
        rabbitMQChannel,
        messageType,
    }: {
        body: string;
        fromUserId: number;
        users: User[];
        room: Room;
        rabbitMQChannel: amqp.Channel;
        messageType: string;
    }) {
        if (room.type !== "private") {
            return;
        }

        if (messageType !== "text") {
            return;
        }

        const isChatGPTChat = users.find((u) => this.agentUser.displayName === u.displayName);

        if (!isChatGPTChat) {
            return;
        }

        let responseText: string = "";

        try {
            responseText = await this.createMessage(fromUserId, body);
        } catch (error) {
            console.error(error);
            responseText = "Error ocurred, please try again latter!";
        }

        const responseBody = { text: responseText };

        await this.sendMessage({
            fromUser: this.agentUser,
            users,
            body: responseBody,
            rabbitMQChannel,
            roomId: room.id,
        });
    }

    /****************************************************** 
            Methods to implement for each agents
    *******************************************************/

    async createMessage(fromUserId: number, body: string): Promise<string> {
        return "Please implement this feature.";
    }

    async helloMessage(): Promise<string> {
        return "Please implement this feature.";
    }

    test() {
        console.log("I'm test agent");
    }
}
