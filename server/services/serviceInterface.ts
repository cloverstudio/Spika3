import express, { Router } from "express";
import amqp from 'amqplib';

export type InitRouterParams = {
    rabbitMQConnetion?: amqp.Connection | undefined | null
}

export type ServiceStartParams = {
    rabbitMQConnetion?: amqp.Connection | undefined | null
}

export default interface Service {
    start(param: ServiceStartParams): void;
    getRoutes?(): Router;
}