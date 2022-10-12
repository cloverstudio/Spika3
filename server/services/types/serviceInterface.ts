import express, { Router } from "express";
import amqp from "amqplib";
import http from "http";
import { createClient } from "redis";

export type InitRouterParams = {
    rabbitMQChannel?: amqp.Channel | undefined | null;
    redisClient?: ReturnType<typeof createClient>;
};

export type ServiceStartParams = {
    rabbitMQChannel?: amqp.Channel | undefined | null;
    server?: http.Server;
    redisClient?: ReturnType<typeof createClient>;
};

export default interface Service {
    start(param: ServiceStartParams): void;
    getRoutes?(): Router;
    server?: http.Server;
}
