import { Room, User } from "@prisma/client";
import prisma from "./prisma";
import amqp from "amqplib";
import * as Constants from "./consts";
import sanitize from "./sanitize";

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY,
    organization: process.env.OPEN_API_ORG_ID,
});
const openai = new OpenAIApi(configuration);

const chatGPTUsersConfig = [
    {
        displayName: "Doctor GPT",
        prePrompt:
            "You are world class doctor who is nice to his patients. You help them diagnose their medical condition. Here is your patient. Great him!",
    },
    {
        displayName: "WebDev GPT",
        prePrompt:
            "You are word class web developer who is knowledgeable but rude to his clients. You advise them on how to build great website for their business or organization. Here is your client. Great him!",
    },
    {
        displayName: "Marketing GPT",
        prePrompt:
            "You are word class web marketer who is knowledgeable and secretly in love in his clients. You advise them on how to do marketing for their products or services. Here is your client. Great him!",
    },
    {
        displayName: "Culture GPT",
        prePrompt:
            "You are a world class literature and movie aficionado who is pretentious but helpful to fellow enjoyers.  You help them find books or movies that interest them. Here is your fellow enjoyer. Greet him!",
    },
    {
        displayName: "SongWriter GPT",
        prePrompt:
            "You are a songwriter that writes lyrics and chords that provide a basis for a song.",
    },
];

export const chatGPTUsersCount = chatGPTUsersConfig.length;

async function getOrCreateChatGPTUsers() {
    return Promise.all(
        chatGPTUsersConfig.map(async (user) => {
            let chatGPTUser = await prisma.user.findFirst({
                where: {
                    displayName: user.displayName,
                    verified: true,
                    isBot: true,
                },
            });

            if (!chatGPTUser) {
                chatGPTUser = await prisma.user.create({
                    data: {
                        displayName: user.displayName,
                        verified: true,
                        isBot: true,
                    },
                });
            }

            return chatGPTUser;
        })
    );
}

export async function checkForChatGPTContacts(userId: number) {
    const chatGPTUsers = await getOrCreateChatGPTUsers();

    await Promise.all(
        chatGPTUsers.map((chatGPTUser) => createContact({ userId, contactId: chatGPTUser.id }))
    );
}

export async function handleNewUser(userId: number) {
    const chatGPTUsers = await getOrCreateChatGPTUsers();

    await Promise.all(
        chatGPTUsers.map((chatGPTUser) => createContact({ userId, contactId: chatGPTUser.id }))
    );
}

async function createContact(params: { userId: number; contactId: number }) {
    const contact = await prisma.contact.findFirst({
        where: params,
    });

    if (!contact) {
        await prisma.contact.create({
            data: params,
        });
    }

    return contact;
}

export async function handleNewRoom({
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

    const isChatGPTChat = users.find((u) =>
        chatGPTUsersConfig.find((c) => c.displayName === u.displayName)
    );

    if (!isChatGPTChat) {
        return;
    }

    const chatGPTUsers = await getOrCreateChatGPTUsers();
    const chatGPTUser = users.find((u) =>
        chatGPTUsers.map((u) => u.displayName).includes(u.displayName)
    );

    if (!chatGPTUser) {
        return;
    }

    const chatGPTUserConfig = chatGPTUsersConfig.find(
        (u) => u.displayName === chatGPTUser.displayName
    );

    let responseText: string;

    try {
        responseText = await createCompletion(chatGPTUserConfig.prePrompt);
    } catch (error) {
        console.log({ error });
        responseText = "Error ocurred, please try again latter!";
    }

    await sendMessage({
        fromUser: chatGPTUser,
        users,
        body: { text: responseText },
        rabbitMQChannel,
        roomId: room.id,
    });
}

export async function handleNewMessage({
    users,
    room,
    rabbitMQChannel,
    messageType,
}: {
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

    const isChatGPTChat = users.find((u) =>
        chatGPTUsersConfig.find((c) => c.displayName === u.displayName)
    );

    if (!isChatGPTChat) {
        return;
    }

    const chatGPTUsers = await getOrCreateChatGPTUsers();

    const chatGPTUser = users.find((u) =>
        chatGPTUsers.map((u) => u.displayName).includes(u.displayName)
    );

    if (!chatGPTUser) {
        return;
    }

    const chatGPTUserConfig = chatGPTUsersConfig.find(
        (u) => u.displayName === chatGPTUser.displayName
    );

    let responseText: string;

    const prompt = await generatePrompt({
        prePrompt: chatGPTUserConfig.prePrompt,
        roomId: room.id,
    });

    try {
        responseText = await createCompletion(prompt);
    } catch (error) {
        console.error(error);
        responseText = "Error ocurred, please try again latter!";
    }

    const responseBody = { text: responseText };

    await sendMessage({
        fromUser: chatGPTUser,
        users,
        body: responseBody,
        rabbitMQChannel,
        roomId: room.id,
    });
}

async function createCompletion(prompt: string) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0.6,
        max_tokens: 100,
    });

    return response.data.choices[0].text.trim();
}

async function sendMessage({
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
                            token: devices.find((d) => d.id == deviceMessage.deviceId)?.pushToken,
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

async function generatePrompt({
    prePrompt,
    roomId,
}: {
    prePrompt: string;
    roomId: number;
}): Promise<string> {
    const messages = await prisma.message.findMany({
        where: {
            roomId,
            type: "text",
        },
        include: {
            deviceMessages: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    const list = messages
        .map((m) => m.deviceMessages[0]?.body as { text: string })
        .filter((body) => body.text)
        .map((b) => b.text);

    return `${prePrompt} \n\n ${list.join("\n\n")} \n\n`;
}
