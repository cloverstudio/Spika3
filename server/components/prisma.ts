import { PrismaClient, Prisma } from "@prisma/client";
import l from "./logger";

interface CustomNodeJsGlobal extends NodeJS.Global {
    prisma: PrismaClient<Prisma.PrismaClientOptions, "info" | "warn" | "error" | "query">;
}

declare const global: CustomNodeJsGlobal;

const prisma: PrismaClient<Prisma.PrismaClientOptions, "info" | "warn" | "error" | "query"> =
    global.prisma ||
    new PrismaClient({
        log: [
            {
                emit: "event",
                level: "query",
            },
        ],
    });

prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();

    l(`Query took ${after - before}ms`);
    return result;
});

prisma.$on("query", async (e: any) => {
    l(`Query: ${e.query}`);
    l(`Params: ${e.params}`);
});

const environment: any = process.env.BRANCH;
if (environment !== "production" && environment !== "staging") global.prisma = prisma;

export default prisma;
