import { before } from "mocha";
import chai from "chai";
import spies from "chai-spies";
import amqp from "amqplib";
import globals from "./global";

before(function (done) {
    this.timeout(10000);
    chai.use(spies);

    (async () => {
        const rabbitMQConnection = await amqp.connect(
            process.env["RABBITMQ_URL"] || "amqp://localhost"
        );

        globals.rabbitMQChannel = await rabbitMQConnection.createChannel();
    })().then(done);
});
