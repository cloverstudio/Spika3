import amqp from "amqplib";
import os from "os";

import * as Constants from "../../components/consts";
import utils from "../../components/utils";
import { SendSSEPayload } from "../types/queuePayloadTypes";

interface connectionInitializer {
    channelId: string;
    onNotify: (data: any) => void;
}

class Connection {
    channelId = "";
    connectionId = "";
    onNotify: (data: any) => void | undefined;

    constructor(params: connectionInitializer) {
        this.channelId = params.channelId;
        this.connectionId = utils.randomString(40);
        this.onNotify = params.onNotify;
    }
}

class NotificationServer {
    exchangeName = Constants.EXCHANGE_NAME;
    connections: { [k: string]: Connection } = {};
    channel: amqp.Channel | null = null;
    hostQueueName = `${process.pid}_${os.hostname}_${utils.randomString(6)}`;
    SSEQueueName = Constants.QUEUE_SSE;

    constructor(channel: amqp.Channel) {
        this.channel = channel;
        this.setUpExchange();
        this.setUpHostQueue();
        this.setUpSSEQueue();
    }

    setUpExchange(): void {
        this.channel.assertExchange(this.exchangeName, "direct");
    }

    setUpSSEQueue(): void {
        this.channel.assertQueue(Constants.QUEUE_SSE, { durable: false });

        this.channel.consume(this.SSEQueueName, async (msg: amqp.ConsumeMessage) => {
            this.channel.ack(msg);
            const payload: SendSSEPayload = JSON.parse(msg.content.toString());

            this.send(payload.channelId, payload.data);
        });
    }

    async setUpHostQueue(): Promise<void> {
        const hostQueue = await this.channel.assertQueue(this.hostQueueName, { durable: false });
        await this.channel.bindQueue(hostQueue.queue, this.exchangeName, "");

        this.channel.consume(
            hostQueue.queue,
            (msg) => {
                this.channel.ack(msg);
                const payload = JSON.parse(msg?.content.toString() as string);

                const channelId = String(payload.channelId);
                const data = payload.data;
                this.notify(channelId, data);
            },
            { exclusive: true }
        );
    }

    subscribe(channelId: string, onEvent: (data: any) => void): string {
        const connection: Connection = new Connection({
            channelId,
            onNotify: onEvent,
        });

        this.connections[connection.connectionId] = connection;
        return connection.connectionId;
    }

    unsubscribe(connectionId: string): void {
        delete this.connections[connectionId];
    }

    notify(channelId: string, data: any): void {
        Object.values(this.connections)
            .filter((con) => con.channelId === channelId)
            .map((con) => con.onNotify && con.onNotify(data));
    }

    send(channelId: string, data: any): void {
        if (!this.channel) {
            return console.log("Channel is not ready");
        }

        const jsonData = JSON.stringify({
            channelId,
            data,
        });

        this.channel.publish(this.exchangeName, "", Buffer.from(jsonData));
    }

    async destroy(): Promise<void> {
        await this.channel.unbindQueue(this.hostQueueName, this.exchangeName, "");
    }
}

export default NotificationServer;
