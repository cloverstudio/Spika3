import express, { Router } from "express";
import amqp from "amqplib";
import http from "http";

export type InitRouterParams = {
    rabbitMQChannel?: amqp.Channel | undefined | null;
};

export type ServiceStartParams = {
    rabbitMQChannel?: amqp.Channel | undefined | null;
    server?: http.Server;
};

export default interface Service {
    start(param: ServiceStartParams): void;
    getRoutes?(): Router;
    server?: http.Server;
}
