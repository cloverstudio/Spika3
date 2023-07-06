import AgentBase from "./agentBase";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions, AgentExecutor } from "langchain/agents";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { exec } from "child_process";

class GoogleSearchAgent extends AgentBase {
    agentExecuters: AgentExecutor[];

    constructor() {
        super();
        this.name = "Petra";
        this.agentExecuters = [];
    }

    test() {
        console.log("I'm petra agent");
    }

    async createMessage(fromUserId: number, body: string): Promise<string> {
        if (!this.agentExecuters[fromUserId]) {
            process.env.LANGCHAIN_HANDLER = "langchain";
            const model = new ChatOpenAI({
                temperature: 0,
                openAIApiKey: process.env.OPEN_API_KEY,
            });
            const tools = [
                new SerpAPI(process.env.SERPAPI_API_KEY, {
                    location: "Croatia",
                    hl: "hr",
                    gl: "hr",
                }),
                new Calculator(),
            ];

            // Passing "chat-conversational-react-description" as the agent type
            // automatically creates and uses BufferMemory with the executor.
            // If you would like to override this, you can pass in a custom
            // memory option, but the memoryKey set on it must be "chat_history".
            const executor = await initializeAgentExecutorWithOptions(tools, model, {
                agentType: "chat-conversational-react-description",
                verbose: true,
            });

            this.agentExecuters[fromUserId] = executor;
        }

        const response = await this.agentExecuters[fromUserId].call({ input: body });

        return response.output;
    }

    async helloMessage(): Promise<string> {
        return "Pozdrav! Ja sam Petra, vaš AI asistent. Kako vam mogu pomoći danas?";
    }
}

export default new GoogleSearchAgent();
