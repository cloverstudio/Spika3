import express, { Router } from "express";
import amqp from "amqplib";

export type InitRouterParams = {
  rabbitMQChannel?: amqp.Channel | undefined | null;
};

export type ServiceStartParams = {
  rabbitMQChannel?: amqp.Channel | undefined | null;
};

export default interface Service {
  start(param: ServiceStartParams): void;
  getRoutes?(): Router;
}
