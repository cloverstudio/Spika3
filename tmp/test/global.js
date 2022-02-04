"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var globals = {
    adminToken: "",
    createdUser: undefined,
    createdDevice: undefined,
    telephoneNumber: undefined,
    deviceId: undefined,
    userToken: "",
    prisma: prisma,
    createdRoom: undefined,
};
exports.default = globals;
//# sourceMappingURL=global.js.map