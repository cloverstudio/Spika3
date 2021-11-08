import express, { Router } from "express";
import amqp from "amqplib";

export default interface QueueWorker {
  run(param: any): Promise<any>;
}
