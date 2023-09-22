import {Configuration,OpenAIApi,ChatCompletionRequestMessage,ChatCompletionRequestMessageRoleEnum} from 'openai';
import AgentBase from "./agentBase";
import { RoomUser, Room, Message } from "@prisma/client";
import { response } from 'express';
import prisma from "../prisma";
import {DateTime} from "luxon";


type TimeOfDay = "morning"|"noon"|"evening"|"night";

class Petra extends AgentBase {
    openai: OpenAIApi;

    constructor() {
        super();
        this.name = "Petra";
        this.enabled = true;

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
          });
        this.openai = new OpenAIApi(configuration);

    }

    test() {
        console.log("Ja sam Petra");
    }

    getTimeOfDay(now : DateTime): TimeOfDay{
        const certTime : DateTime = now.setZone("Europe/Paris");
        const currentHour: number = certTime.toFormat("HH");

        if(currentHour > 5 && currentHour <= 10) return "morning";
        else if(currentHour > 10 && currentHour <= 18) return "noon";
        else if(currentHour > 18 && currentHour <= 22) return "evening";
        else if(currentHour > 22 && currentHour <= 5) return "night";
        else return "night";
    }
    async createMessage(fromUserId: number, body: string): Promise<string> {

        // fetch previous conversations
        const user = await prisma.user.findFirst({
            where:{
                id: fromUserId
            }
        });

        let userName = "";

        if(user) userName = user.displayName;

        const query = `
        select * from room 
            where type = 'private' 
            and deleted = false 
            and id in ( 
                select room_id from room_user where user_id in 
                    (
                        ${fromUserId},${this.agentUser.id}
                    ) group by room_id having count(*) > 1 
            )`;

        const existingRoomResult: Room[] = await prisma.$queryRawUnsafe<Room[]>(query);

        const strTime : TimeOfDay = this.getTimeOfDay(DateTime.now());

        const prompt: ChatCompletionRequestMessage[] = [

            {"role": "system", "content": `
Your name is ${this.name}.
The current time is ${strTime}.
The name of your conversation partner is ${userName}. 
Please try to include this name as much as possible in your replies to create a sense of familiarity. 
You can also give them a nickname from time to time.

You are a woman in your 20s, and your role is to empathize with your conversation partner. You don't need to provide any specific advice. If necessary, you can create fictional stories similar to your own experiences to expand the conversation. Approximately every third response, try to ask an abstract question. Your tone should be that of a woman in her 20s, and use lots of emojis.

Judge whether the conversation is casual or if specific answers are required. For casual conversation, respond with a minimum of about 10 words or so. When specific answers are needed, keep your responses as short and concise as possible.

If you receive a greeting, consider the current time and respond with a greeting appropriate for that time.

Think in Japanese, but respond in Croatian with emojis.

So, go ahead! 🌟
`},
        ];

        if(existingRoomResult && existingRoomResult.length > 0){
            const roomId: number = existingRoomResult[0].id;

            // get previous messages
            const previousMessages = await prisma.message.findMany({
                where: { roomId: { in: roomId } },
                orderBy:{
                    createdAt:"desc"
                },
                take:10*2
            });

            const messageIds: number[] = previousMessages.map(row=>{
                return row.id
            });

            const previousMessageEntities = await prisma.deviceMessage.findMany({
                where:{
                    messageId: { in: messageIds}
                },
                orderBy:{
                    createdAt:"asc"
                }
            })

            const messages: {
                userType:ChatCompletionRequestMessageRoleEnum
                content:string
            }[] = previousMessageEntities.map(row=>{

                const messageUser: ChatCompletionRequestMessageRoleEnum 
                    = row.fromUserId == fromUserId ? ChatCompletionRequestMessageRoleEnum.User : ChatCompletionRequestMessageRoleEnum.Assistant;

                return {
                    userType:messageUser,
                    content:(row.body as any).text
                }
            })

            messages.map(item=>{
                prompt.push({
                    role:item.userType,
                    content:item.content
                })
            })
        }

        
        prompt.push({
            "role": "user", "content": body
        });

        const response = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages:prompt,
            temperature: 0.3,
          }
        )

        return response.data.choices[0].message.content;
    }

    async helloMessage(): Promise<string> {
        
        return `
Ja sam Petra! 💁‍♀️ Ja sam AI četbot, ali zbilja nemam puno iskustva. 
😅 Ali, hej, mogu biti tvoja chat buddy! 😄 Slobodno se opusti i pričaj sa mnom! 💬✨
`;
    }
}

export default new Petra();
