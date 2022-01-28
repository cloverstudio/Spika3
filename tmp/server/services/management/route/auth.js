"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var logger_1 = require("../../../components/logger");
var adminTokens_1 = __importDefault(require("../lib/adminTokens"));
var adminAuth_1 = __importDefault(require("../lib/adminAuth"));
exports.default = (function (params) {
    var router = (0, express_1.Router)();
    var localToken = "localToken";
    router.get("/check", adminAuth_1.default, function (req, res) {
        try {
            return res.send("true");
        }
        catch (e) {
            (0, logger_1.error)(e);
            res.status(500).send("Server error " + e);
        }
    });
    router.get("/", function (req, res) {
        try {
            return res.send("OK");
        }
        catch (e) {
            (0, logger_1.error)(e);
            res.status(500).send("Server error " + e);
        }
    });
    router.post("/", function (req, res) {
        try {
            var username = process.env.ADMIN_USERNAME;
            var password = process.env.ADMIN_PASSWORD;
            if (req.body.username !== username || req.body.password !== password)
                return res.status(403).send("Invalid username or password");
            var newToken = adminTokens_1.default.newToken();
            res.send(newToken);
        }
        catch (e) {
            (0, logger_1.error)(e);
            res.status(500).send("Server error " + e);
        }
    });
    return router;
});
//# sourceMappingURL=auth.js.map