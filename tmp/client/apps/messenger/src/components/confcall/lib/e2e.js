"use strict";
/**
 * Insertable streams.
 *
 * https://github.com/webrtc/samples/blob/gh-pages/src/content/insertable-streams/endtoend-encryption/js/main.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupReceiverTransform = exports.setupSenderTransform = exports.setCryptoKey = exports.isSupported = void 0;
var Logger_1 = require("./Logger");
var logger = new Logger_1.Logger('e2e');
var e2eSupported = undefined;
var worker = undefined;
function isSupported() {
    if (e2eSupported === undefined) {
        if (RTCRtpSender.prototype.createEncodedStreams) {
            try {
                var stream = new ReadableStream();
                window.postMessage(stream, '*', [stream]);
                worker = new Worker('/resources/js/e2e-worker.js', { name: 'e2e worker' });
                logger.debug('isSupported() | supported');
                e2eSupported = true;
            }
            catch (error) {
                logger.debug("isSupported() | not supported: " + error);
                e2eSupported = false;
            }
        }
        else {
            logger.debug('isSupported() | not supported');
            e2eSupported = false;
        }
    }
    return e2eSupported;
}
exports.isSupported = isSupported;
function setCryptoKey(operation, key, useCryptoOffset) {
    logger.debug('setCryptoKey() [operation:%o, useCryptoOffset:%o]', operation, useCryptoOffset);
    assertSupported();
    worker.postMessage({
        operation: operation,
        currentCryptoKey: key,
        useCryptoOffset: useCryptoOffset
    });
}
exports.setCryptoKey = setCryptoKey;
function setupSenderTransform(sender) {
    logger.debug('setupSenderTransform()');
    assertSupported();
    var senderStreams = sender.createEncodedStreams();
    var readableStream = senderStreams.readable || senderStreams.readableStream;
    var writableStream = senderStreams.writable || senderStreams.writableStream;
    worker.postMessage({
        operation: 'encode',
        readableStream: readableStream,
        writableStream: writableStream
    }, [readableStream, writableStream]);
}
exports.setupSenderTransform = setupSenderTransform;
function setupReceiverTransform(receiver) {
    logger.debug('setupReceiverTransform()');
    assertSupported();
    var receiverStreams = receiver.createEncodedStreams();
    var readableStream = receiverStreams.readable || receiverStreams.readableStream;
    var writableStream = receiverStreams.writable || receiverStreams.writableStream;
    worker.postMessage({
        operation: 'decode',
        readableStream: readableStream,
        writableStream: writableStream
    }, [readableStream, writableStream]);
}
exports.setupReceiverTransform = setupReceiverTransform;
function assertSupported() {
    if (e2eSupported === false)
        throw new Error('e2e not supported');
    else if (e2eSupported === undefined)
        throw new Error('e2e not initialized, must call isSupported() first');
}
//# sourceMappingURL=e2e.js.map