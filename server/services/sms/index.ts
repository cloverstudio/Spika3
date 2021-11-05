// sms service consumes rabbit mq queue and sends sms

import { Router, Request, Response } from "express";
import amqp from 'amqplib';

import * as Constants from "../../components/consts"
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { SendSMSPayload } from "../types/queuePayloadTypes";

import sendSMSWorker from "./worker/sendSMS";

export default class SMSService implements Service {
    async start({ rabbitMQChannel }: ServiceStartParams) {

        rabbitMQChannel.consume(Constants.QUEUE_SMS, async (msg: amqp.ConsumeMessage) => {
            const payload: SendSMSPayload = JSON.parse(msg.content.toString());
            await sendSMSWorker.run(payload);
            rabbitMQChannel.ack(msg);
        });

    }

    async test() {

    }

}