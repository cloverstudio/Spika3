import { before, after, beforeEach, afterEach } from "mocha";
import chai, { expect } from "chai";
import app from "../server";
import NotificationServer from "../server/services/sse/notificationServer";
import globals from "./global";
import http from "http";
import * as Constants from "../server/components/consts";

import EventSource from "eventsource";
import { wait } from "../client/lib/utils";

describe("SSE Service", () => {
    describe("NotificationServer", () => {
        let notificationServer: NotificationServer;
        beforeEach(async () => {
            notificationServer = new NotificationServer(globals.rabbitMQChannel);
            await wait(0.2);
        });
        afterEach(async () => {
            await notificationServer.destroy();
        });

        it("Can save connection", async () => {
            const channelId = "channelId";

            notificationServer.subscribe(channelId, console.log);

            expect(notificationServer.connections).to.be.an("object");

            const allConnections = Object.values(notificationServer.connections);
            expect(allConnections).to.be.an("array");
            expect(allConnections).to.have.lengthOf(1);

            const connection = allConnections[0];
            expect(connection).to.be.an("object");
            expect(connection.channelId).to.eqls(channelId);
        });

        it("Can subscribe to channel get notification", async () => {
            const channelId = "channelId";
            const data = { foo: "bar" };
            const eventSpy = chai.spy((_: any) => true);

            notificationServer.subscribe(channelId, eventSpy);

            notificationServer.send(channelId, data);
            await wait(0.2);
            expect(eventSpy).to.have.been.called.once;
            expect(eventSpy).to.have.been.called.with(data);
        });

        it("Can subscribe to channel get multiple notifications", async () => {
            const channelId = "channelId";
            const data = { foo: "bar" };
            const eventSpy = chai.spy((_: any) => true);

            notificationServer.subscribe(channelId, eventSpy);

            notificationServer.send(channelId, data);
            notificationServer.send(channelId, data);
            await wait(0.2);
            expect(eventSpy).to.have.been.called.exactly(2);
        });

        it("Send is triggered by pushing data to SSE queue", async () => {
            const channelId = "channelId";
            const data = { foo: "bar" };
            const eventSpy = chai.spy((_: any) => true);

            notificationServer.subscribe(channelId, eventSpy);

            globals.rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SSE,
                Buffer.from(
                    JSON.stringify({
                        channelId,
                        data,
                    })
                )
            );

            await wait(0.2);
            expect(eventSpy).to.have.been.called.once;
            expect(eventSpy).to.have.been.called.with(data);
        });

        it("Gets only subscribed channels notifications", async () => {
            const channelId = "channelId";
            const channelTwoId = "channelTwoId";
            const data = { foo: "bar" };

            const eventSpyOne = chai.spy((_: any) => true);
            const eventSpyTwo = chai.spy((_: any) => true);

            notificationServer.subscribe(channelId, eventSpyOne);
            notificationServer.subscribe(channelTwoId, eventSpyTwo);

            notificationServer.send(channelId, data);
            await wait(0.2);
            expect(eventSpyOne).to.have.been.called.once;
            expect(eventSpyTwo).to.not.have.been.called();
        });

        it("Can unsubscribe", async () => {
            const channelId = "channelId";
            const data = { foo: "bar" };

            const eventSpy = chai.spy((_: any) => true);

            const connectionId = notificationServer.subscribe(channelId, eventSpy);
            notificationServer.unsubscribe(connectionId);

            notificationServer.send(channelId, data);
            await wait(0.2);
            expect(eventSpy).to.not.have.been.called();
        });

        it("Can be destroyed", async () => {
            const channelId = "channelId";
            const data = { foo: "bar" };
            const eventSpy = chai.spy((_: any) => true);

            notificationServer.subscribe(channelId, eventSpy);

            await notificationServer.destroy();

            notificationServer.send(channelId, data);
            await wait(0.2);
            expect(eventSpy).to.not.have.been.called();
        });
    });

    describe("SSE API", () => {
        let server: http.Server;
        before(async () => {
            return new Promise((res) => {
                server = app.listen(3020, () => {
                    res();
                });
            });
        });
        after(() => {
            server.close();
        });

        it("Sends event-stream", async () => {
            const channelId = globals.deviceId;
            const data = { foo: "bar" };

            const eventSpy = chai.spy((_: any) => true);

            const source = new EventSource(
                `http://localhost:3020/api/sse?accesstoken=${globals.userToken}`
            );

            source.onmessage = function (event) {
                if (event.data.length > 0) eventSpy(event.data);
            };

            await wait(0.2);

            // send data
            globals.rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SSE,
                Buffer.from(
                    JSON.stringify({
                        channelId,
                        data,
                    })
                )
            );

            await wait(0.2);

            source.close();

            expect(eventSpy).to.have.been.called.once;
            expect(eventSpy).to.have.been.called.with(JSON.stringify(data));
        });
    });
});
