import chai, { expect } from "chai";
import sendPush from "../server/services/push/worker/sendPush";
import * as sendFcmMessage from "../server/services/push/lib/sendFcmMessage";
import { PUSH_TYPE_NEW_MESSAGE } from "../server/components/consts";
import { afterEach, beforeEach } from "mocha";

describe("Send Push Worker", () => {
    beforeEach(() => {
        chai.spy.on(sendFcmMessage, "default", () => true);
    });

    afterEach(() => {
        chai.spy.restore(sendFcmMessage, "default");
    });

    it("Sends push for new message", async () => {
        await sendPush.run({
            type: PUSH_TYPE_NEW_MESSAGE,
            token: "dummy_token",
            data: {
                deviceMessage: {
                    body: {
                        text: "testing",
                    },
                },
                message: {
                    body: {
                        text: "testing",
                    },
                },
            },
        });

        expect(sendFcmMessage.default).to.have.been.called.once;
        expect(sendFcmMessage.default).to.have.been.called.with({
            message: {
                token: "dummy_token",
                data: {
                    message: JSON.stringify({ body: { text: "testing" } }),
                },
            },
        });
    });

    it("Doesn't send push if type is not implemented", async () => {
        await sendPush.run({
            type: "NOT_IMPLEMENTED",
            token: "dummy_token",
            data: {},
        });

        expect(sendFcmMessage.default).to.not.have.been.called();
    });
});
