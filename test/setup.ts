import { before } from "mocha";
import chai from "chai";
import spies from "chai-spies";
import amqp from "amqplib";
import globals from "./global";
import { createClient } from "redis";

before(function (done) {
    this.timeout(10000);
    chai.use(spies);

    (async () => {
        const rabbitMQConnection = await amqp.connect(
            process.env["RABBITMQ_URL"] || "amqp://localhost"
        );
        const redisClient = createClient({ url: process.env.REDIS_URL });

        redisClient.on("error", (err) => console.log("Redis Client Error", err));

        await redisClient.connect();
        await redisClient.flushAll();

        globals.rabbitMQChannel = await rabbitMQConnection.createChannel();
        globals.redisClient = redisClient;
    })().then(done);
});
