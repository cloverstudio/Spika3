import { before } from "mocha";
import chai from "chai";
import spies from "chai-spies";
import amqp from "amqplib";
import globals from "./global";

before(async () => {
    chai.use(spies);

    const rabbitMQConnection = await amqp.connect(
        process.env["RABBITMQ_URL"] || "amqp://localhost"
    );

    globals.rabbitMQChannel = await rabbitMQConnection.createChannel();

    return Promise.resolve();
});
