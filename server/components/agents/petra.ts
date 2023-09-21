import AgentBase from "./agentBase";

class Petra extends AgentBase {
    constructor() {
        super();
        this.name = "Petra";
        this.enabled = true;
    }

    test() {
        console.log("Ja sam Petra");
    }

    async createMessage(fromUserId: number, body: string): Promise<string> {
        return `Hello`;
    }

    async helloMessage(): Promise<string> {
        return "Hi, I'm echo bot. I reply you what you said.";
    }
}

export default new Petra();
