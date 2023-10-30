import express from "express";
import twilio from "twilio";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const toNumber = process.env.TWILIO_TO_NUMBER;
const port = process.env.PORT || 4200;

const client = twilio(accountSid, authToken);

const app = express();

app.use(express.json());

app.post("/", async (req, res) => {
    try {
        const body = req.body;

        const alert = body?.alerts?.[0] || {};
        if (!alert.status) {
            return res.json({ error: "No status in alert" });
        }

        let status = alert.status;
        const event = status.toUpperCase() + " " + alert.labels?.alertname || "Nepoznati događaj";
        const description = alert.annotations?.summary || "";

        const message = `Event: ${event}\nDescription: ${description}`;

        const twilioResult = await client.messages.create({
            body: message,
            from: fromNumber,
            to: toNumber,
        });

        console.log("Message: ", message, " sent to ", toNumber);

        res.json({ twilioResult });
    } catch (error) {
        console.log({ error });
        res.json({ error });
    }
});

app.listen(port, () => {
    console.log("Server started on port 4200");
});
