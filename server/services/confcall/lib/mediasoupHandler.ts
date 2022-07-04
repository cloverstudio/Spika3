import * as mediasoup from "mediasoup";

import l, { error as le, warn as lw } from "../../../components/logger";
import config from "./config";

type Peer = {
    peerId: string;
    roomId: string;
    name: string;
    producerTransports?: Array<mediasoup.types.Transport>;
    consumerTransports?: Array<mediasoup.types.Transport>;
    producers?: mediasoup.types.Producer;
    consumers?: Array<mediasoup.types.Consumer>;
};

type Room = {
    transport?: mediasoup.types.Transport;
    router?: mediasoup.types.Router;
    peers: Record<string, Peer>;
};

class MediasoupHandler {
    mediasoupWorkers: Array<mediasoup.types.Worker>;
    rooms: Array<Room>;

    constructor() {
        const { numWorkers } = config.mediasoup;
        this.mediasoupWorkers = [];
        this.rooms = [];

        l("running %d mediasoup Workers...", numWorkers);

        (async () => {
            for (let i = 0; i < numWorkers; ++i) {
                const worker = await mediasoup.createWorker({
                    logLevel: config.mediasoup.workerSettings
                        .logLevel as mediasoup.types.WorkerLogLevel,
                    logTags: config.mediasoup.workerSettings
                        .logTags as Array<mediasoup.types.WorkerLogTag>,
                    rtcMinPort: Number(config.mediasoup.workerSettings.rtcMinPort),
                    rtcMaxPort: Number(config.mediasoup.workerSettings.rtcMaxPort),
                });

                worker.on("died", () => {
                    le("mediasoup Worker died, exiting  in 2 seconds... [pid:%d]", worker.pid);

                    setTimeout(() => process.exit(1), 2000);
                });

                this.mediasoupWorkers.push(worker);

                // Log worker resource usage every X seconds.
                setInterval(async () => {
                    const usage = await worker.getResourceUsage();

                    //l("mediasoup Worker resource usage [pid:%d]: %o", worker.pid, usage);
                }, 120000);
            }
        })();
    }

    join() {}
}

export default new MediasoupHandler();
