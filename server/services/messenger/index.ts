import { Router, Request, Response } from "express";

import testRouter from "./route/test";

import Service from "../serviceInterface"
export default class Messenger implements Service {
    async start(){

    }

    getRoutes(){
        const messengerRouter = Router();
        messengerRouter.use("/test", testRouter);
        return messengerRouter;
    }

    async test(){
        
    }
    
}