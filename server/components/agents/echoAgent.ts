import AgentBase from "./agentBase";

class EchoAgent extends AgentBase {
    constructor() {
        super();
        this.name = "EchoBot";
    }

    test() {
        console.log("I'm echo agent");
    }

    async createMessage(fromUserId: number, body: string): Promise<string> {
        return `Hello I'm echo bot. You said ${body}`;
    }

    async helloMessage(): Promise<string> {
        return "Hi, I'm echo bot. I reply you what you said.";
    }
}

export default new EchoAgent();
