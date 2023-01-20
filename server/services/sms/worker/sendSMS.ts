import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { SendSMSPayload } from "../../types/queuePayloadTypes";
import l, { error as le } from "../../../components/logger";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = require("twilio")(accountSid, authToken);

class sendSMSWorker implements QueueWorkerInterface {
    async run(payload: SendSMSPayload) {
        if (process.env.IS_TEST === "1") {
            return l("Ignore sending SMS");
        }

        try {
            const twilioResult = await client.messages.create({
                body: payload.content,
                from: process.env.TWILIO_FROM_NUMBER,
                to: payload.telephoneNumber,
            });

            l("Twilio: ", twilioResult.body);
        } catch (error) {
            le("Twilio error: ", error);
        }
    }
}

export default new sendSMSWorker();
