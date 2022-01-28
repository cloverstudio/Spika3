"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var os = require("os");
var path = require("path");
var repl = require("repl");
var readline = require("readline");
var net = require("net");
var fs = require("fs");
var mediasoup = require("mediasoup");
var colors = require("colors/safe");
var pidusage = require("pidusage");
var SOCKET_PATH_UNIX = "/tmp/mediasoup-demo.sock";
var SOCKET_PATH_WIN = path.join("\\\\?\\pipe", process.cwd(), "mediasoup-demo");
var SOCKET_PATH = os.platform() === "win32" ? SOCKET_PATH_WIN : SOCKET_PATH_UNIX;
// Maps to store all mediasoup objects.
var workers = new Map();
var routers = new Map();
var transports = new Map();
var producers = new Map();
var consumers = new Map();
var dataProducers = new Map();
var dataConsumers = new Map();
var Interactive = /** @class */ (function () {
    function Interactive(socket) {
        this._socket = socket;
        this._isTerminalOpen = false;
    }
    Interactive.prototype.openCommandConsole = function () {
        var _this = this;
        this.log("\n[opening Readline Command Console...]");
        this.log("type help to print available commands");
        var cmd = readline.createInterface({
            input: this._socket,
            output: this._socket,
            terminal: true,
        });
        cmd.on("close", function () {
            if (_this._isTerminalOpen)
                return;
            _this.log("\nexiting...");
            _this._socket.end();
        });
        var readStdin = function () {
            cmd.question("cmd> ", function (input) { return __awaiter(_this, void 0, void 0, function () {
                var params, command, _a, usage, _i, _b, worker, level, promises, _c, _d, worker, error_1, tags, promises, _e, _f, worker, error_2, _g, _h, worker, dump, error_3, id, router, dump, error_4, id, transport, dump, error_5, id, producer, dump, error_6, id, consumer, dump, error_7, id, dataProducer, dump, error_8, id, dataConsumer, dump, error_9, id, transport, stats, error_10, id, producer, stats, error_11, id, consumer, stats, error_12, id, dataProducer, stats, error_13, id, dataConsumer, stats, error_14, filename;
                var _this = this;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            params = input.split(/[\s\t]+/);
                            command = params.shift();
                            _a = command;
                            switch (_a) {
                                case "": return [3 /*break*/, 1];
                                case "h": return [3 /*break*/, 2];
                                case "help": return [3 /*break*/, 2];
                                case "u": return [3 /*break*/, 3];
                                case "usage": return [3 /*break*/, 3];
                                case "logLevel": return [3 /*break*/, 9];
                                case "logTags": return [3 /*break*/, 14];
                                case "dw": return [3 /*break*/, 19];
                                case "dumpWorkers": return [3 /*break*/, 19];
                                case "dr": return [3 /*break*/, 26];
                                case "dumpRouter": return [3 /*break*/, 26];
                                case "dt": return [3 /*break*/, 31];
                                case "dumpTransport": return [3 /*break*/, 31];
                                case "dp": return [3 /*break*/, 36];
                                case "dumpProducer": return [3 /*break*/, 36];
                                case "dc": return [3 /*break*/, 41];
                                case "dumpConsumer": return [3 /*break*/, 41];
                                case "ddp": return [3 /*break*/, 46];
                                case "dumpDataProducer": return [3 /*break*/, 46];
                                case "ddc": return [3 /*break*/, 51];
                                case "dumpDataConsumer": return [3 /*break*/, 51];
                                case "st": return [3 /*break*/, 56];
                                case "statsTransport": return [3 /*break*/, 56];
                                case "sp": return [3 /*break*/, 61];
                                case "statsProducer": return [3 /*break*/, 61];
                                case "sc": return [3 /*break*/, 66];
                                case "statsConsumer": return [3 /*break*/, 66];
                                case "sdp": return [3 /*break*/, 71];
                                case "statsDataProducer": return [3 /*break*/, 71];
                                case "sdc": return [3 /*break*/, 76];
                                case "statsDataConsumer": return [3 /*break*/, 76];
                                case "hs": return [3 /*break*/, 81];
                                case "heapsnapshot": return [3 /*break*/, 81];
                                case "t": return [3 /*break*/, 82];
                                case "terminal": return [3 /*break*/, 82];
                            }
                            return [3 /*break*/, 83];
                        case 1:
                            {
                                readStdin();
                                return [3 /*break*/, 84];
                            }
                            _j.label = 2;
                        case 2:
                            {
                                this.log("");
                                this.log("available commands:");
                                this.log("- h,  help                    : show this message");
                                this.log("- usage                       : show CPU and memory usage of the Node.js and mediasoup-worker processes");
                                this.log("- logLevel level              : changes logLevel in all mediasoup Workers");
                                this.log("- logTags [tag] [tag]         : changes logTags in all mediasoup Workers (values separated by space)");
                                this.log("- dw, dumpWorkers             : dump mediasoup Workers");
                                this.log("- dr, dumpRouter [id]         : dump mediasoup Router with given id (or the latest created one)");
                                this.log("- dt, dumpTransport [id]      : dump mediasoup Transport with given id (or the latest created one)");
                                this.log("- dp, dumpProducer [id]       : dump mediasoup Producer with given id (or the latest created one)");
                                this.log("- dc, dumpConsumer [id]       : dump mediasoup Consumer with given id (or the latest created one)");
                                this.log("- ddp, dumpDataProducer [id]  : dump mediasoup DataProducer with given id (or the latest created one)");
                                this.log("- ddc, dumpDataConsumer [id]  : dump mediasoup DataConsumer with given id (or the latest created one)");
                                this.log("- st, statsTransport [id]     : get stats for mediasoup Transport with given id (or the latest created one)");
                                this.log("- sp, statsProducer [id]      : get stats for mediasoup Producer with given id (or the latest created one)");
                                this.log("- sc, statsConsumer [id]      : get stats for mediasoup Consumer with given id (or the latest created one)");
                                this.log("- sdp, statsDataProducer [id] : get stats for mediasoup DataProducer with given id (or the latest created one)");
                                this.log("- sdc, statsDataConsumer [id] : get stats for mediasoup DataConsumer with given id (or the latest created one)");
                                this.log("- hs, heapsnapshot            : write a heapdump snapshot to file");
                                this.log("- t,  terminal                : open Node REPL Terminal");
                                this.log("");
                                readStdin();
                                return [3 /*break*/, 84];
                            }
                            _j.label = 3;
                        case 3: return [4 /*yield*/, pidusage(process.pid)];
                        case 4:
                            usage = _j.sent();
                            this.log("Node.js process [pid:" + process.pid + "]:\n" + JSON.stringify(usage, null, "  "));
                            _i = 0, _b = workers.values();
                            _j.label = 5;
                        case 5:
                            if (!(_i < _b.length)) return [3 /*break*/, 8];
                            worker = _b[_i];
                            return [4 /*yield*/, pidusage(worker.pid)];
                        case 6:
                            usage = _j.sent();
                            this.log("mediasoup-worker process [pid:" + worker.pid + "]:\n" + JSON.stringify(usage, null, "  "));
                            _j.label = 7;
                        case 7:
                            _i++;
                            return [3 /*break*/, 5];
                        case 8: return [3 /*break*/, 84];
                        case 9:
                            level = params[0];
                            promises = [];
                            for (_c = 0, _d = workers.values(); _c < _d.length; _c++) {
                                worker = _d[_c];
                                promises.push(worker.updateSettings({ logLevel: level }));
                            }
                            _j.label = 10;
                        case 10:
                            _j.trys.push([10, 12, , 13]);
                            return [4 /*yield*/, Promise.all(promises)];
                        case 11:
                            _j.sent();
                            this.log("done");
                            return [3 /*break*/, 13];
                        case 12:
                            error_1 = _j.sent();
                            this.error(String(error_1));
                            return [3 /*break*/, 13];
                        case 13: return [3 /*break*/, 84];
                        case 14:
                            tags = params;
                            promises = [];
                            for (_e = 0, _f = workers.values(); _e < _f.length; _e++) {
                                worker = _f[_e];
                                promises.push(worker.updateSettings({ logTags: tags }));
                            }
                            _j.label = 15;
                        case 15:
                            _j.trys.push([15, 17, , 18]);
                            return [4 /*yield*/, Promise.all(promises)];
                        case 16:
                            _j.sent();
                            this.log("done");
                            return [3 /*break*/, 18];
                        case 17:
                            error_2 = _j.sent();
                            this.error(String(error_2));
                            return [3 /*break*/, 18];
                        case 18: return [3 /*break*/, 84];
                        case 19:
                            _g = 0, _h = workers.values();
                            _j.label = 20;
                        case 20:
                            if (!(_g < _h.length)) return [3 /*break*/, 25];
                            worker = _h[_g];
                            _j.label = 21;
                        case 21:
                            _j.trys.push([21, 23, , 24]);
                            return [4 /*yield*/, worker.dump()];
                        case 22:
                            dump = _j.sent();
                            this.log("worker.dump():\n" + JSON.stringify(dump, null, "  "));
                            return [3 /*break*/, 24];
                        case 23:
                            error_3 = _j.sent();
                            this.error("worker.dump() failed: " + error_3);
                            return [3 /*break*/, 24];
                        case 24:
                            _g++;
                            return [3 /*break*/, 20];
                        case 25: return [3 /*break*/, 84];
                        case 26:
                            id = params[0] || Array.from(routers.keys()).pop();
                            router = routers.get(id);
                            if (!router) {
                                this.error("Router not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 27;
                        case 27:
                            _j.trys.push([27, 29, , 30]);
                            return [4 /*yield*/, router.dump()];
                        case 28:
                            dump = _j.sent();
                            this.log("router.dump():\n" + JSON.stringify(dump, null, "  "));
                            return [3 /*break*/, 30];
                        case 29:
                            error_4 = _j.sent();
                            this.error("router.dump() failed: " + error_4);
                            return [3 /*break*/, 30];
                        case 30: return [3 /*break*/, 84];
                        case 31:
                            id = params[0] || Array.from(transports.keys()).pop();
                            transport = transports.get(id);
                            if (!transport) {
                                this.error("Transport not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 32;
                        case 32:
                            _j.trys.push([32, 34, , 35]);
                            return [4 /*yield*/, transport.dump()];
                        case 33:
                            dump = _j.sent();
                            this.log("transport.dump():\n" + JSON.stringify(dump, null, "  "));
                            return [3 /*break*/, 35];
                        case 34:
                            error_5 = _j.sent();
                            this.error("transport.dump() failed: " + error_5);
                            return [3 /*break*/, 35];
                        case 35: return [3 /*break*/, 84];
                        case 36:
                            id = params[0] || Array.from(producers.keys()).pop();
                            producer = producers.get(id);
                            if (!producer) {
                                this.error("Producer not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 37;
                        case 37:
                            _j.trys.push([37, 39, , 40]);
                            return [4 /*yield*/, producer.dump()];
                        case 38:
                            dump = _j.sent();
                            this.log("producer.dump():\n" + JSON.stringify(dump, null, "  "));
                            return [3 /*break*/, 40];
                        case 39:
                            error_6 = _j.sent();
                            this.error("producer.dump() failed: " + error_6);
                            return [3 /*break*/, 40];
                        case 40: return [3 /*break*/, 84];
                        case 41:
                            id = params[0] || Array.from(consumers.keys()).pop();
                            consumer = consumers.get(id);
                            if (!consumer) {
                                this.error("Consumer not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 42;
                        case 42:
                            _j.trys.push([42, 44, , 45]);
                            return [4 /*yield*/, consumer.dump()];
                        case 43:
                            dump = _j.sent();
                            this.log("consumer.dump():\n" + JSON.stringify(dump, null, "  "));
                            return [3 /*break*/, 45];
                        case 44:
                            error_7 = _j.sent();
                            this.error("consumer.dump() failed: " + error_7);
                            return [3 /*break*/, 45];
                        case 45: return [3 /*break*/, 84];
                        case 46:
                            id = params[0] || Array.from(dataProducers.keys()).pop();
                            dataProducer = dataProducers.get(id);
                            if (!dataProducer) {
                                this.error("DataProducer not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 47;
                        case 47:
                            _j.trys.push([47, 49, , 50]);
                            return [4 /*yield*/, dataProducer.dump()];
                        case 48:
                            dump = _j.sent();
                            this.log("dataProducer.dump():\n" + JSON.stringify(dump, null, "  "));
                            return [3 /*break*/, 50];
                        case 49:
                            error_8 = _j.sent();
                            this.error("dataProducer.dump() failed: " + error_8);
                            return [3 /*break*/, 50];
                        case 50: return [3 /*break*/, 84];
                        case 51:
                            id = params[0] || Array.from(dataConsumers.keys()).pop();
                            dataConsumer = dataConsumers.get(id);
                            if (!dataConsumer) {
                                this.error("DataConsumer not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 52;
                        case 52:
                            _j.trys.push([52, 54, , 55]);
                            return [4 /*yield*/, dataConsumer.dump()];
                        case 53:
                            dump = _j.sent();
                            this.log("dataConsumer.dump():\n" + JSON.stringify(dump, null, "  "));
                            return [3 /*break*/, 55];
                        case 54:
                            error_9 = _j.sent();
                            this.error("dataConsumer.dump() failed: " + error_9);
                            return [3 /*break*/, 55];
                        case 55: return [3 /*break*/, 84];
                        case 56:
                            id = params[0] || Array.from(transports.keys()).pop();
                            transport = transports.get(id);
                            if (!transport) {
                                this.error("Transport not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 57;
                        case 57:
                            _j.trys.push([57, 59, , 60]);
                            return [4 /*yield*/, transport.getStats()];
                        case 58:
                            stats = _j.sent();
                            this.log("transport.getStats():\n" + JSON.stringify(stats, null, "  "));
                            return [3 /*break*/, 60];
                        case 59:
                            error_10 = _j.sent();
                            this.error("transport.getStats() failed: " + error_10);
                            return [3 /*break*/, 60];
                        case 60: return [3 /*break*/, 84];
                        case 61:
                            id = params[0] || Array.from(producers.keys()).pop();
                            producer = producers.get(id);
                            if (!producer) {
                                this.error("Producer not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 62;
                        case 62:
                            _j.trys.push([62, 64, , 65]);
                            return [4 /*yield*/, producer.getStats()];
                        case 63:
                            stats = _j.sent();
                            this.log("producer.getStats():\n" + JSON.stringify(stats, null, "  "));
                            return [3 /*break*/, 65];
                        case 64:
                            error_11 = _j.sent();
                            this.error("producer.getStats() failed: " + error_11);
                            return [3 /*break*/, 65];
                        case 65: return [3 /*break*/, 84];
                        case 66:
                            id = params[0] || Array.from(consumers.keys()).pop();
                            consumer = consumers.get(id);
                            if (!consumer) {
                                this.error("Consumer not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 67;
                        case 67:
                            _j.trys.push([67, 69, , 70]);
                            return [4 /*yield*/, consumer.getStats()];
                        case 68:
                            stats = _j.sent();
                            this.log("consumer.getStats():\n" + JSON.stringify(stats, null, "  "));
                            return [3 /*break*/, 70];
                        case 69:
                            error_12 = _j.sent();
                            this.error("consumer.getStats() failed: " + error_12);
                            return [3 /*break*/, 70];
                        case 70: return [3 /*break*/, 84];
                        case 71:
                            id = params[0] || Array.from(dataProducers.keys()).pop();
                            dataProducer = dataProducers.get(id);
                            if (!dataProducer) {
                                this.error("DataProducer not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 72;
                        case 72:
                            _j.trys.push([72, 74, , 75]);
                            return [4 /*yield*/, dataProducer.getStats()];
                        case 73:
                            stats = _j.sent();
                            this.log("dataProducer.getStats():\n" + JSON.stringify(stats, null, "  "));
                            return [3 /*break*/, 75];
                        case 74:
                            error_13 = _j.sent();
                            this.error("dataProducer.getStats() failed: " + error_13);
                            return [3 /*break*/, 75];
                        case 75: return [3 /*break*/, 84];
                        case 76:
                            id = params[0] || Array.from(dataConsumers.keys()).pop();
                            dataConsumer = dataConsumers.get(id);
                            if (!dataConsumer) {
                                this.error("DataConsumer not found");
                                return [3 /*break*/, 84];
                            }
                            _j.label = 77;
                        case 77:
                            _j.trys.push([77, 79, , 80]);
                            return [4 /*yield*/, dataConsumer.getStats()];
                        case 78:
                            stats = _j.sent();
                            this.log("dataConsumer.getStats():\n" + JSON.stringify(stats, null, "  "));
                            return [3 /*break*/, 80];
                        case 79:
                            error_14 = _j.sent();
                            this.error("dataConsumer.getStats() failed: " + error_14);
                            return [3 /*break*/, 80];
                        case 80: return [3 /*break*/, 84];
                        case 81:
                            {
                                filename = (process.env.SNAPSHOT_DIR || "/tmp") + "/" + Date.now() + "-mediasoup-demo.heapsnapshot";
                                // eslint-disable-next-line no-shadow
                                heapdump.writeSnapshot(filename, function (error, filename) {
                                    if (!error) {
                                        _this.log("heapdump snapshot writen to " + filename);
                                        _this.log("learn how to use it at https://github.com/bnoordhuis/node-heapdump");
                                    }
                                    else {
                                        _this.error("heapdump snapshot failed: " + error);
                                    }
                                });
                                return [3 /*break*/, 84];
                            }
                            _j.label = 82;
                        case 82:
                            {
                                this._isTerminalOpen = true;
                                cmd.close();
                                this.openTerminal();
                                return [2 /*return*/];
                            }
                            _j.label = 83;
                        case 83:
                            {
                                this.error("unknown command '" + command + "'");
                                this.log("press 'h' or 'help' to get the list of available commands");
                            }
                            _j.label = 84;
                        case 84:
                            readStdin();
                            return [2 /*return*/];
                    }
                });
            }); });
        };
        readStdin();
    };
    Interactive.prototype.openTerminal = function () {
        var _this = this;
        this.log("\n[opening Node REPL Terminal...]");
        this.log("here you have access to workers, routers, transports, producers, consumers, dataProducers and dataConsumers ES6 maps");
        var terminal = repl.start({
            input: this._socket,
            output: this._socket,
            terminal: true,
            prompt: "terminal> ",
            useColors: true,
            useGlobal: true,
            ignoreUndefined: false,
            preview: false,
        });
        this._isTerminalOpen = true;
        terminal.on("exit", function () {
            _this.log("\n[exiting Node REPL Terminal...]");
            _this._isTerminalOpen = false;
            _this.openCommandConsole();
        });
    };
    Interactive.prototype.log = function (msg) {
        this._socket.write(colors.green(msg) + "\n");
    };
    Interactive.prototype.error = function (msg) {
        this._socket.write("" + colors.red.bold("ERROR: ") + colors.red(msg) + "\n");
    };
    return Interactive;
}());
function runMediasoupObserver() {
    mediasoup.observer.on("newworker", function (worker) {
        // Store the latest worker in a global variable.
        global.worker = worker;
        workers.set(worker.pid, worker);
        worker.observer.on("close", function () { return workers.delete(worker.pid); });
        worker.observer.on("newrouter", function (router) {
            // Store the latest router in a global variable.
            global.router = router;
            routers.set(router.id, router);
            router.observer.on("close", function () { return routers.delete(router.id); });
            router.observer.on("newtransport", function (transport) {
                // Store the latest transport in a global variable.
                global.transport = transport;
                transports.set(transport.id, transport);
                transport.observer.on("close", function () { return transports.delete(transport.id); });
                transport.observer.on("newproducer", function (producer) {
                    // Store the latest producer in a global variable.
                    global.producer = producer;
                    producers.set(producer.id, producer);
                    producer.observer.on("close", function () { return producers.delete(producer.id); });
                });
                transport.observer.on("newconsumer", function (consumer) {
                    // Store the latest consumer in a global variable.
                    global.consumer = consumer;
                    consumers.set(consumer.id, consumer);
                    consumer.observer.on("close", function () { return consumers.delete(consumer.id); });
                });
                transport.observer.on("newdataproducer", function (dataProducer) {
                    // Store the latest dataProducer in a global variable.
                    global.dataProducer = dataProducer;
                    dataProducers.set(dataProducer.id, dataProducer);
                    dataProducer.observer.on("close", function () {
                        return dataProducers.delete(dataProducer.id);
                    });
                });
                transport.observer.on("newdataconsumer", function (dataConsumer) {
                    // Store the latest dataConsumer in a global variable.
                    global.dataConsumer = dataConsumer;
                    dataConsumers.set(dataConsumer.id, dataConsumer);
                    dataConsumer.observer.on("close", function () {
                        return dataConsumers.delete(dataConsumer.id);
                    });
                });
            });
        });
    });
}
module.exports = function () {
    return __awaiter(this, void 0, void 0, function () {
        var server;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Run the mediasoup observer API.
                    runMediasoupObserver();
                    // Make maps global so they can be used during the REPL terminal.
                    global.workers = workers;
                    global.routers = routers;
                    global.transports = transports;
                    global.producers = producers;
                    global.consumers = consumers;
                    global.dataProducers = dataProducers;
                    global.dataConsumers = dataConsumers;
                    server = net.createServer(function (socket) {
                        var interactive = new Interactive(socket);
                        interactive.openCommandConsole();
                    });
                    return [4 /*yield*/, new Promise(function (resolve) {
                            try {
                                fs.unlinkSync(SOCKET_PATH);
                            }
                            catch (error) { }
                            server.listen(SOCKET_PATH, resolve);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=interactiveServer.js.map