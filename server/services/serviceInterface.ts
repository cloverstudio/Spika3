import express,{Router} from "express";

export default interface Service {
    start(): void;
    getRoutes?():  Router;
}