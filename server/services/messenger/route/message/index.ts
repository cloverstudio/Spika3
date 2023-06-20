import { Router } from "express";

import { InitRouterParams } from "../../../types/serviceInterface";

import createMessageRoute from "./createMessage";
import editMessageRoute from "./editMessage";
import deleteMessageRote from "./deleteMessage";
import getMessageRecordsRoute from "./getMessageRecords";
import getMessagesByRoomRoute from "./getMessagesByRoom";
import createDeliveredMessageRecordRoute from "./createDeliveredMessageRecord";
import createSeenMessageRecordRoute from "./createSeenMessageRecord";
import getMessagesSyncRoute from "./getMessagesSync";
import getModifiedMessagesSyncRoute from "./getModifiedMessagesSync";
import searchMessagesRoute from "./searchMessages";

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): Router => {
    const router = Router();

    router.post("/", createMessageRoute({ rabbitMQChannel, redisClient }));
    router.put("/:id", editMessageRoute({ rabbitMQChannel }));
    router.delete("/:id", deleteMessageRote({ rabbitMQChannel }));

    router.get("/:id/message-records", getMessageRecordsRoute({}));

    // only web should call this route
    router.get("/roomId/:roomId", getMessagesByRoomRoute({ rabbitMQChannel, redisClient }));

    router.post("/delivered", createDeliveredMessageRecordRoute({ rabbitMQChannel }));
    router.post("/:roomId/seen", createSeenMessageRecordRoute({ rabbitMQChannel, redisClient }));

    router.get("/sync/modified/:lastUpdate", getModifiedMessagesSyncRoute({}));
    router.get("/sync/:lastUpdate", getMessagesSyncRoute({}));

    router.get("/:roomId/search", searchMessagesRoute({ redisClient }));

    return router;
};
