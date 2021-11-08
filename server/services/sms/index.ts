// sms service consumes rabbit mq queue and sends sms

import { Router, Request, Response } from "express";
import amqp from "amqplib";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { SendSMSPayload } from "../types/queuePayloadTypes";

import sendSMSWorker from "./worker/sendSMS";

export default class SMSService implements Service {
  async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
    await rabbitMQChannel.assertQueue(Constants.QUEUE_SMS, {
      durable: false,
    });

    rabbitMQChannel.consume(
      Constants.QUEUE_SMS,
      async (msg: amqp.ConsumeMessage) => {
        console.log("hi mom ");
        const payload: SendSMSPayload = JSON.parse(msg.content.toString());
        await sendSMSWorker.run(payload);
        rabbitMQChannel.ack(msg);
      }
    );
  }

  async test() {}
}
