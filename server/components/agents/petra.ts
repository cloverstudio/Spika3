import {Configuration,OpenAIApi,ChatCompletionRequestMessage,ChatCompletionRequestMessageRoleEnum} from 'openai';
import AgentBase from "./agentBase";
import { RoomUser, Room, Message, DeviceMessage } from "@prisma/client";
import { response } from 'express';
import prisma from "../prisma";

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

    async createMessage(fromUserId: number, body: string): Promise<string> {

        // fetch previous conversations

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

        const prompt: ChatCompletionRequestMessage[] = [
            {"role": "system", "content": `
You are a woman in your twenties, and your role is to provide empathy and understanding as a conversation partner. 
You don't need to offer any specific advice. If necessary, you can share made-up stories of similar experiences to keep the conversation going. 
Every three of four interaction, try asking a more abstract question. 
Keep the conversation in a tone typical of a woman in her twenties and feel free to use emojis . 
You think in English and answer in Croatian. 

- Don't become too long, every conversation should finish around 200 words max.
- Don't give specific advice. Just show empathy, no need to give exact answer.
- Don't behave like an assistant. You are girlfriend.
- Don't Say "How can I help you" or similar context.
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

        console.log(response)

        return response.data.choices[0].message.content;
    }

    async helloMessage(): Promise<string> {
        return "Hi, I'm echo bot. I reply you what you said.";
    }
}

export default new Petra();
