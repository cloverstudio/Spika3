import crypto from "crypto";
import dayjs from "dayjs";

import * as Consts from "./consts";
import Config from "./config";
import { Request, Response } from "express";

export interface FormData {
    fields: any;
    files: any;
}

export default class utils {
    static isEmpty = (val: string): boolean => {
        return val === undefined || val === null || val == "";
    };

    static isEmptyNumber = (val: number): boolean => {
        return val === undefined || val === null;
    };

    static randomString = (length: number) => {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    static randomNumber = (length: number) => {
        let result = "";
        const characters = "0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    static wait = (duration: number) => {
        return new Promise((res) => {
            setTimeout(() => {
                res(null);
            }, duration * 1000);
        });
    };

    static waitToUpdate = (obj: any, paramName: string) => {
        const initialObj = obj[paramName];

        return new Promise((res) => {
            const timer = setInterval(() => {
                console.log(initialObj, obj[paramName]);
                if (initialObj !== obj[paramName]) {
                    clearTimeout(timer);
                    res(null);
                }
            }, 1000);
        });
    };

    static isMobile = (): boolean => {
        if (typeof window !== "undefined") {
            return window.innerWidth < 768;
        }

        return false;
    };

    static isBrowser = (): boolean => {
        return typeof window !== "undefined";
    };

    static truncateString = (str: string, limit = 16): string => {
        let suffix = "";
        if (str.length > limit) suffix = "...";

        return str.substr(0, limit) + suffix;
    };

    static sha256 = (original: string): string => {
        const shasum = crypto.createHash("sha256");
        shasum.update(original);
        const hash = shasum.digest("hex");
        return hash;
    };

    static checkLoginName = (loginName: string): boolean => {
        return /^[a-zA-Z0-9_-]{6,}$/.test(loginName);
    };

    static checkPassword = (password: string): boolean => {
        return /^[a-zA-Z0-9_-]{6,}$/.test(password);
    };

    static createToken = (): string => {
        return this.randomString(16);
    };

    static getTokenExpireDate = (): Date => {
        return dayjs().add(Consts.TOKEN_VALID_DAY, "days").toDate();
    };

    static generateRoomName = (): string => {
        return this.randomString(16);
    };

    static isValidURL = (str: string) => {
        const pattern = new RegExp(
            "^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$",
            "i"
        ); // fragment locator
        return !!pattern.test(str);
    };

    static getDurationInMilliseconds = (start: [number, number]) => {
        const NS_PER_SEC = 1e9;
        const NS_TO_MS = 1e6;
        const diff = process.hrtime(start);

        return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
    };

    static verifyRecaptcha = async ({ recaptchaToken }: { recaptchaToken: string }) => {
        const url = `https://www.google.com/recaptcha/api/siteverify`;

        const params = new URLSearchParams();
        params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
        params.append("response", recaptchaToken);

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        return res.json();
    };

    static setAuthCookies(
        request: Request,
        response: Response,
        accessToken: string,
        userId: number,
        origin: string,
    ): void {
        const cookieConfig = { ...Config.cookieConfig };

        if (
            origin &&
            (origin.includes("localhost") ||
                origin.includes("192.168") ||
                origin.includes("10."))
        ) {
            delete cookieConfig.sameSite;
            cookieConfig.sameSite = "none";
        }

        response.cookie("accesstoken", accessToken, cookieConfig);
        response.cookie("userId", userId, cookieConfig);

        const cookieConfigIsLoggedIn = { ...cookieConfig };
        cookieConfigIsLoggedIn.httpOnly = false;
        response.cookie("isLoggedIn", true, cookieConfigIsLoggedIn);
    }

    static clearAuthCookies(request: Request, response: Response, origin: string): void {
        const cookieConfig = { ...Config.cookieConfig };

        if (
            origin &&
            (origin.includes("localhost") ||
                origin.includes("192.168") ||
                origin.includes("10."))
        ) {
            // delete cookieConfig.domain;
            delete cookieConfig.sameSite;
            cookieConfig.sameSite = "none";
        }

        response.clearCookie("accesstoken", cookieConfig);
        response.clearCookie("userId", cookieConfig);
        const cookieConfigIsLoggedIn = { ...cookieConfig };
        cookieConfigIsLoggedIn.httpOnly = false;
        response.cookie("isLoggedIn", false, cookieConfigIsLoggedIn);
    }
}
