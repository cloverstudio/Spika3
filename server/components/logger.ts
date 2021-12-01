export default function (...aynthing: any): void {
    if (process.env.LOG_INFO !== "0") {
        console.log(...aynthing);
    }
}

export function error(...aynthing: any): void {
    if (process.env.LOG_ERROR !== "0") {
        console.error(...aynthing);
    }
}

export function warn(...aynthing: any): void {
    if (process.env.LOG_WARN !== "0") {
        console.warn(...aynthing);
    }
}
