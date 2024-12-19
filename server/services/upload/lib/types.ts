import { Router, Request, Response } from "express";
import { User, Device } from "@prisma/client";

export interface UserRequest extends Request {
    user: User;
    device: Device;
    lang: string;
    isAdmin: boolean;
}

export interface errorParams {
    path: string;
    originalValue: string;
}
