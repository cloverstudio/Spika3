import { PrismaClient } from "@prisma/client";

interface CustomNodeJsGlobal extends NodeJS.Global {
    prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

const prisma: PrismaClient =
    global.prisma ||
    new PrismaClient({
        log: [
            {
                emit: "event",
                level: "query",
            },
        ],
    });

/*
prisma.$on('query' as any, async (e: any) => {
    console.log(`${e.query} : ${e.duration}`)
});
*/

const environment: any = process.env.BRANCH;
if (environment !== "production" && environment !== "staging") global.prisma = prisma;

export default prisma;
