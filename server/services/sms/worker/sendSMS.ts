import QueueWorkerInterface from "../../types/queueWokerInterface";
import { SendSMSPayload } from "../../types/queuePayloadTypes";
import l from "../../../components/logger"
import internal from "stream";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = require('twilio')(accountSid, authToken);

class sendSMSWorker implements QueueWorkerInterface {
    async run(payload: SendSMSPayload) {

        if (process.env.IS_TEST === "1") {
            return l("Ignore sending SMS");
        }

        const twilioResult = await client.messages
            .create({
                body: payload.content,
                from: process.env.TWILIO_FROM_NUMBER,
                to: payload.telephoneNumber
            });

        l("Twilio: ", twilioResult)

    }
}

export default new sendSMSWorker();