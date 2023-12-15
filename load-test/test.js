import EventSource from "eventsource";
import { API_BASE_URL, phoneNumbers, MAX_RESPONSE_TIME } from "./config.js";
import ManagementAPI from "./ManagementAPI.js";
import MessengerAPI from "./MessengerAPI.js";

class Test {
    constructor() {
        this.users = [];
        this.devices = [];
        this.roomId = null;
        this.monitorUserId = 26;
        this.roomName = "Test room " + new Date().toISOString();
        this.SSEUrl = `${API_BASE_URL}/sse`;
        this.newMessagesCount = 0;
        this.seenAPICall = 0;
        this.newSeenMessagesCount = 0;
        this.newDeliveredMessagesCount = 0;

        this.phase = 0;
        this.chancesToSendSMS = [0.3, 0.3, 0.3];
        this.requestSent = 0;
        this.requestFinished = 0;
        this.testStarted = false;
        this.testFinished = false;
        this.times = [];
        this.testStartedTime = null;
        this.testFinishedTime = null;
        this.testFailed = false;
    }

    async init() {
        console.clear();
        console.log("Initializing test: creating users, devices, room...");
        await this.initManagementAPI();

        this.users = await this.ensureUsers();
        this.devices = await this.ensureDevices();
        this.roomId = await this.createRoom();
        await this.addUsersToRoom(this.users, this.roomId);

        await this.connectUsersToSSE();

        this.startTest();

        const loggingInterval = setInterval(() => {
            console.clear();
            const timeElapsed = this.testFinishedTime
                ? +this.testFinishedTime - +this.testStartedTime
                : +new Date() - +this.testStartedTime;
            console.log("Test started", this.testStartedTime.toISOString());
            if (this.testFinishedTime) {
                console.log("Test finished", this.testFinishedTime.toISOString());
            }
            console.log("Time elapsed", Math.round(timeElapsed / 1000), "s");
            console.log("Phase", this.phase);
            console.log("Request sent", this.requestSent);
            console.log("Request finished", this.requestFinished);
            console.log("Messages events", this.newMessagesCount);
            console.log("Seen API calls", this.seenAPICall);
            console.log("Seen messages events", this.newSeenMessagesCount);
            console.log("Delivered messages events", this.newDeliveredMessagesCount);
            console.log("Test finished", this.testFinished);

            if (this.testFailed) {
                console.error("Test failed because of long response time (more than 10 seconds)");
                return clearInterval(loggingInterval);
            }

            if (this.times.length) {
                // log p95
                const times = this.times.sort((a, b) => a - b);
                const p95 = times[Math.floor(times.length * 0.95)];
                console.log("p95", p95);

                // log p99
                const p99 = times[Math.floor(times.length * 0.99)];
                console.log("p99", p99);

                // log average
                const sum = times.reduce((acc, time) => acc + time, 0);
                const average = sum / times.length;
                console.log("Average", average);
            }
        }, 1000);
    }

    startTest() {
        this.testStartedTime = new Date();

        setInterval(() => {
            if (!this.testFinished) {
                this.sendMessages();
            } else if (!this.testFailed && this.requestSent === this.requestFinished) {
                console.log("Got all responses, test finished");

                //  process.exit();
            }
        }, 1000);

        const phaseInterval = setInterval(() => {
            if (this.phase < 2) {
                this.phase++;
            } else {
                this.testFinished = true;

                if (!this.testFinishedTime) {
                    this.testFinishedTime = new Date();
                }

                clearInterval(phaseInterval);
            }
        }, 20000);
    }

    async sendMessages() {
        for (const device of this.devices) {
            if (Math.random() > 1 - this.chancesToSendSMS[this.phase]) {
                this.requestSent++;
                const time = performance.now();
                await MessengerAPI.sendMessage(
                    {
                        roomId: this.roomId,
                        type: "text",
                        body: {
                            text: "Test message",
                        },
                    },
                    device.token,
                );
                const timeElapsed = performance.now() - time;
                if (timeElapsed > MAX_RESPONSE_TIME) {
                    console.error("test finished");
                    this.testFailed = true;
                    this.testFinished = true;
                    this.testFinishedTime = new Date();
                }
                console.log("Message sent", timeElapsed);
                this.times.push(timeElapsed);

                this.requestFinished++;
            }
        }
    }

    async initManagementAPI() {
        this.managementAPI = new ManagementAPI();
        await this.managementAPI.init("admin", "password");
    }

    async ensureUsers() {
        const users = [];

        for (const telephoneNumber of phoneNumbers) {
            try {
                const user = await this.managementAPI.createUser({
                    telephoneNumber,
                    displayName: telephoneNumber,
                });
                if (user) {
                    users.push(user);
                }
            } catch (error) {
                console.error({ error, telephoneNumber });
            }
        }

        return users;
    }

    createRoom() {
        return this.managementAPI.createRoom({ name: this.roomName });
    }

    async addUsersToRoom() {
        const usersIds = [...this.users.map((user) => user.id), this.monitorUserId];

        await this.managementAPI.addUsersToRoom(usersIds, this.roomId);
    }

    async ensureDevices() {
        const usersIds = [...this.users.map((user) => user.id)];

        const devices = [];

        for (const userId of usersIds) {
            const activeDevice = await this.managementAPI.getActiveUserDevice(userId);

            if (activeDevice) {
                devices.push(activeDevice);
                continue;
            }

            const newDevice = await this.managementAPI.createUserDevice(
                userId,
                userId + new Date().toISOString(),
            );

            if (newDevice) {
                devices.push(newDevice);
            }
        }

        return devices;
    }

    async connectUsersToSSE() {
        for (const device of this.devices) {
            await this.connectUserToSSE(device);
        }
    }

    connectUserToSSE(device) {
        return new Promise((resolve, reject) => {
            const evtSource = new EventSource(this.SSEUrl + "?accessToken=" + device.token);

            evtSource.onopen = () => {
                resolve();
            };

            evtSource.onerror = (e) => {
                const message = `error: ${e}`;
                console.log({ message, userId: device.userId });
                reject();
            };

            evtSource.onmessage = async (e) => {
                const data = JSON.parse(e.data);
                if (data.type === "PING") {
                    return;
                }

                switch (data.type) {
                    case "NEW_MESSAGE": {
                        this.newMessagesCount++;
                        try {
                            this.seenAPICall++;
                            await MessengerAPI.createSeenMessageRecords(this.roomId, device.token);
                        } catch (createSeenMessageRecordsError) {
                            console.log({ createSeenMessageRecordsError });
                            process.exit();
                            throw createSeenMessageRecordsError;
                        }
                        break;
                    }
                    case "NEW_MESSAGE_RECORD": {
                        const messageRecord = data.messageRecord || {};
                        if (messageRecord.type === "seen") {
                            this.newSeenMessagesCount++;
                        } else if (messageRecord.type === "delivered") {
                            this.newDeliveredMessagesCount++;
                        }
                        break;
                    }
                    default: {
                        console.log("UNKNOWN TYPE SSE ERROR ", data.type);
                    }
                }
            };
        });
    }
}

const test = new Test();

test.init();
