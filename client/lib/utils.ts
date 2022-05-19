import hash from "crypto-js/sha256";
import * as constants from "../lib/constants";

export function wait(sec: number): Promise<void> {
    return new Promise<void>((res) => {
        setTimeout(() => {
            res();
        }, sec * 1000);
    });
}

export function generateRandomString(length: number): string {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function sha256(original: string): string {
    return hash(original).toString();
}

export function formatDate(date: Date): string {
    return date.toLocaleString();
}

export type DeviceInfo = {
    browser: string;
    browser_ver: string;
    OS: string;
    OS_ver: string;
};

export function getBrowserOSinfo(): DeviceInfo {
    return {
        browser: "",
        browser_ver: "",
        OS: "",
        OS_ver: "",
    };
}

export function getDeviceId(): string {
    if (!window.localStorage.getItem(constants.LSKEY_DEVICEID)) {
        window.localStorage.setItem(constants.LSKEY_DEVICEID, generateRandomString(14));
    }

    return window.localStorage.getItem(constants.LSKEY_DEVICEID);
}
