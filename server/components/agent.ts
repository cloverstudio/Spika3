import { Room, User } from "@prisma/client";
import prisma from "./prisma";
import amqp from "amqplib";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import path from "path";
import AgentBase from "./agents/agentBase";
import { file } from "googleapis/build/src/apis/file";

const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY,
    organization: process.env.OPEN_API_ORG_ID,
});
const openai = new OpenAIApi(configuration);

const loadedAgents: AgentBase[] = [];
const loadedAgentFiles: string[] = [];

const dirPath: string = path.resolve(__dirname, "agents");
const fileNames: string[] = fs.readdirSync(dirPath);
export const chatGPTUsersCount = fileNames.filter((f) => /js$/.test(f)).length - 1;

export async function loadAgents() {
    const dirPath: string = path.resolve(__dirname, "agents");
    const fileNames: string[] = fs.readdirSync(dirPath);

    for (let key in fileNames) {
        const filePath: string = fileNames[key];

        // ignore base class
        if (/base/i.test(filePath)) continue;

        // ignore if file doesn't finish with .js
        if (!/^.*js$/i.test(filePath)) continue;

        // disable multiple times loading
        if (loadedAgentFiles.indexOf(filePath) !== -1) continue;

        console.log(`Loading agent ${filePath}...`);

        // all files under this path should extend the agentBase class.
        const agentImporter = await import(`./agents/${filePath.split(".")[0]}`);
        const agent: AgentBase = agentImporter.default;
        agent.createOrLoad();

        loadedAgentFiles.push(filePath);
        loadedAgents.push(agent);
    }
}

export async function handleNewUser(userId: number) {
    await Promise.all(loadedAgents.map((agent) => agent.createContact({ userId })));
}

export async function checkForAgentContacts(userId: number) {
    await Promise.all(loadedAgents.map((agent) => agent.createContact({ userId })));
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
    await Promise.all(
        loadedAgents.map((agent) =>
            agent.handleNewRoom({
                users,
                room,
                rabbitMQChannel,
            })
        )
    );
}

export async function handleNewMessage({
    body,
    fromUserId,
    users,
    room,
    rabbitMQChannel,
    messageType,
}: {
    body: any;
    fromUserId: number;
    users: User[];
    room: Room;
    rabbitMQChannel: amqp.Channel;
    messageType: string;
}) {
    // ignore if messagte is not text
    if (!body.text) return;

    await Promise.all(
        loadedAgents.map((agent) =>
            agent.handleNewMessage({
                body: body.text,
                fromUserId,
                users,
                room,
                rabbitMQChannel,
                messageType,
            })
        )
    );
}
