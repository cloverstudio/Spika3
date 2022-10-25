import express, { Router } from "express";
import { Channel } from "amqplib";

export default interface QueueWorker {
    run(param: any, channel?: Channel): Promise<any>;
}
