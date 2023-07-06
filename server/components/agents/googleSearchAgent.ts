import AgentBase from "./agentBase";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions, AgentExecutor } from "langchain/agents";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";

import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";

class GoogleSearchAgent extends AgentBase {
    agentExecuters: AgentExecutor[];
    model: ChatOpenAI;

    constructor() {
        super();
        this.name = "Petra";
        this.agentExecuters = [];

        this.model = new ChatOpenAI({
            temperature: 0,
            openAIApiKey: process.env.OPEN_API_KEY,
            modelName: "gpt-3.5-turbo",
        });
    }

    test() {
        console.log("I'm petra agent");
    }

    async createMessage(fromUserId: number, body: string): Promise<string> {
        if (!this.agentExecuters[fromUserId]) {
            process.env.LANGCHAIN_HANDLER = "langchain";

            const tools = [
                new SerpAPI(process.env.SERPAPI_API_KEY, {
                    location: "Croatia",
                    hl: "hr",
                    gl: "hr",
                }),
                new Calculator(),
            ];

            const executor = await initializeAgentExecutorWithOptions(tools, this.model, {
                agentType: "chat-conversational-react-description",
                verbose: true,
            });

            this.agentExecuters[fromUserId] = executor;
        }

        const translatePrompt = ChatPromptTemplate.fromPromptMessages([
            SystemMessagePromptTemplate.fromTemplate(
                "You are a helpful assistant that translates {input_language} to {output_language}. As also all units should be fit with the {output_language}"
            ),
            HumanMessagePromptTemplate.fromTemplate("{text}"),
        ]);

        const chainEng = new LLMChain({ llm: this.model, prompt: translatePrompt });
        const responseEng = await chainEng.call({
            input_language: "Croatian",
            output_language: "English",
            text: body,
        });

        const response = await this.agentExecuters[fromUserId].call({ input: responseEng.text });

        const responseCro = await chainEng.call({
            input_language: "English",
            output_language: "Croatian",
            text: response.output,
        });

        return responseCro.text;
    }

    async helloMessage(): Promise<string> {
        return "Pozdrav! Ja sam Petra, vaš AI asistent. Kako vam mogu pomoći danas?";
    }
}

export default new GoogleSearchAgent();
