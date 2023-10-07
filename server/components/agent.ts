import { RoomUser, Room, User } from "@prisma/client";
import prisma from "./prisma";
import amqp from "amqplib";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import path from "path";
import { file } from "googleapis/build/src/apis/file";
import axios from "axios";


type chatbotEventRequest = {
    event: "load"|"newUser"|"newRoom"|"createContact"|"newMessage"
    data?: any,
    responsibleBotId: number
}

async function fetchBotUsers(): Promise<User[]>{

    const users = await prisma.user.findMany({
        where: {
            isBot: true,
            deleted: false
        },
    });

    return users;

}

async function sendEvent(url: string, data: chatbotEventRequest): Promise<any> {
    try{
        return await axios.post(url,data);
    }catch(e){
        console.error("Bot webhook error",{
            url:url,
            event: data.event,
            data: data.data,
        },e.message)
    }
    
}

export async function loadAgents() {

    const botUsers = await fetchBotUsers();

    await Promise.all(botUsers.map(async (bot)=> {

        if(bot.webhookUrl){
            await sendEvent(bot.webhookUrl,{
                event: "load",
                responsibleBotId: bot.id
            },)
        }

    }));

}

export async function handleNewUser(userId: number) {
//    await Promise.all(loadedAgents.map((agent) => agent.createContact({ userId })));
}

export async function checkForAgentContacts(userId: number) {
//    await Promise.all(loadedAgents.map((agent) => agent.createContact({ userId })));
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
/*
    await Promise.all(
        loadedAgents.map((agent) =>
            agent.handleNewRoom({
                users,
                room,
                rabbitMQChannel,
            })
        )
    );
*/
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

    const botUsers = await fetchBotUsers();

    // get room members
    const roomUsers = await prisma.roomUser.findMany({
        where: {
            roomId: room.id
        },
    });

    const roomMemberUserId = roomUsers.map(u=>{
        return u.userId
    })

    await Promise.all(botUsers.map(async (bot)=> {
  
        if(fromUserId === bot.id)
            return;

        if(!roomMemberUserId.find(userId=> userId == bot.id))
            return;
        
        if(!bot.webhookUrl)
            return;

        console.log(`send webhook for bot id ${bot.id}`)

        await sendEvent(bot.webhookUrl,{
            event: "newMessage",
            responsibleBotId: bot.id,
            data:{
                body: body.text,
                fromUserId,
                users,
                room,
                messageType,
            }
        })

    }));


/*
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
*/
}
