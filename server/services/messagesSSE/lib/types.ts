import { Request } from "express";
import { User, Device, Room } from "@prisma/client";

export interface UserRequest extends Request {
    user: User;
    device: Device;
    room: Room;
    lang: string;
}

export interface errorParams {
    path: string;
    originalValue: string;
}
