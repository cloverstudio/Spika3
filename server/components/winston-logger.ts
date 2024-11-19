import { createLogger, format, Logger } from "winston";
import { TransformableInfo } from "logform";
import TransportStream from "winston-transport";

// Recursive function to truncate long strings in the body
const deepTruncate = (obj: any, maxLength = 100): any => {
    if (typeof obj === "string") {
        return obj.length > maxLength ? `${obj.substring(0, maxLength)}... [truncated]` : obj;
    }

    // If it's an array, iterate over the elements
    if (Array.isArray(obj)) {
        return obj.map((item) => deepTruncate(item, maxLength));
    }

    // If it's an object, iterate over the properties
    if (typeof obj === "object" && obj !== null) {
        const newObj: any = {};
        Object.keys(obj).forEach((key) => {
            newObj[key] = deepTruncate(obj[key], maxLength);
        });
        return newObj;
    }

    // For other types, return as-is
    return obj;
};

// Custom transport for separating stdout and stderr
class CustomConsoleTransport extends TransportStream {
    log(info: TransformableInfo, callback: () => void): void {
        setImmediate(() => this.emit("logged", info));
        // Route 'info' and 'warn' logs to stdout, 'error' logs to stderr
        if (info.level.includes("error")) {
            process.stderr.write(`${this.formatLog(info)}\n`);
        } else {
            process.stdout.write(`${this.formatLog(info)}\n`);
        }

        callback();
    }

    private formatLog(info: TransformableInfo): string {
        const { timestamp, level, message, stack } = info;
        const log = `[${timestamp}] ${level}: ${message}`;
        return stack ? `${log}\n${stack}` : log;
    }
}

// Create logger with custom transport
const logger: Logger = createLogger({
    level: "info", // Default log level for stdout
    transports: [new CustomConsoleTransport()],
    format: format.combine(
        format.errors({ stack: true }),
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message, stack }: TransformableInfo) => {
            const log = `[${timestamp}] ${level}: ${message}`;
            return stack ? `${log}\n${stack}` : log;
        }),
    ),
});

export { logger, deepTruncate };
