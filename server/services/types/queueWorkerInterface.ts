import { Channel } from "amqplib";
import { createClient } from "redis";

export default interface QueueWorker {
    run(param: any, channel?: Channel, redisClient?: ReturnType<typeof createClient>): Promise<any>;
}
