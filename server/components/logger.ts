import { logger } from "./winston-logger";

export default function (...aynthing: any): void {
    if (process.env.LOG_INFO !== "0") {
        logger.info(aynthing);
        //console.log(...aynthing);
    }
}

export function error(...aynthing: any): void {
    if (process.env.LOG_ERROR !== "0") {
        //logger.error(aynthing);
        console.error(...aynthing);
    }
}

export function warn(...aynthing: any): void {
    if (process.env.LOG_WARN !== "0") {
        logger.warn(aynthing);
        //console.warn(...aynthing);
    }
}
