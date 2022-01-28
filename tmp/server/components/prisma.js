"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = global.prisma ||
    new client_1.PrismaClient({
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
var enviroment = process.env.BRANCH;
if (enviroment !== "production" && enviroment !== "staging")
    global.prisma = prisma;
exports.default = prisma;
//# sourceMappingURL=prisma.js.map