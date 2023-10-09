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

// this function is used when user signed up after bot created
export async function handleNewUser(userId: number) {

    // add to contact list if not exists
    const botUsers = await fetchBotUsers();

    await Promise.all(botUsers.map(async (bot)=> {

        const contact = await prisma.contact.findFirst({
            where: {
                userId: userId,
                contactId: bot.id,
            },
        });

        if (!contact) {
            await prisma.contact.create({
                data: {
                    userId: userId,
                    contactId: bot.id,
                },
            });

            await prisma.contact.create({
                data: {
                    userId: bot.id,
                    contactId: userId,
                },
            });

            await sendEvent(bot.webhookUrl,{
                event: "newUser",
                responsibleBotId: bot.id,
                data:{
                    userId
                }
            }) 
    
        }

    }));
    
}

// this function supports the bot creation was after user signed up.
export async function checkForAgentContacts(userId: number) {

    // add to contact list if not exists
    const botUsers = await fetchBotUsers();

    await Promise.all(botUsers.map(async (bot)=> {

        const contact = await prisma.contact.findFirst({
            where: {
                userId: userId,
                contactId: bot.id,
            },
        });

        if (!contact) {

            await prisma.contact.create({
                data: {
                    userId: userId,
                    contactId: bot.id,
                },
            });

            await prisma.contact.create({
                data: {
                    userId: bot.id,
                    contactId: userId,
                },
            });

            await sendEvent(bot.webhookUrl,{
                event: "newUser",
                responsibleBotId: bot.id,
                data:{
                    userId
                }
            }) 

        }

    }));
    
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

    const botUsers = await fetchBotUsers();

    await Promise.all(botUsers.map(async (bot)=> {

        await sendEvent(bot.webhookUrl,{
            event: "newRoom",
            responsibleBotId: bot.id,
            data:{
                users,
                room
            }
        })

    }));

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
}
