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
import forwardMessageRoute from "./forwardMessage";
import getLinkThumbnail from "./getLinkThumbnail";
import getTargetMessagesBatchByRoom from "./getTargetMessageBatchByRoom";
import getTargetMessageIdByDate from "./getTargetMessageIdByDate";
import getOldestMessageDate from "./getOldestMessageDate";

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): Router => {
    const router = Router();

    router.post("/", createMessageRoute({ rabbitMQChannel, redisClient }));
    router.put("/:id", editMessageRoute({ rabbitMQChannel }));
    router.delete("/:id", deleteMessageRote({ rabbitMQChannel }));

    router.get("/:id/message-records", getMessageRecordsRoute({}));
    router.post("/forward", forwardMessageRoute({ rabbitMQChannel, redisClient }));

    router.get("/get-thumbnail", getLinkThumbnail());

    // only web should call this route
    router.get("/search", searchMessagesRoute({ redisClient }));
    router.get("/roomId/:roomId", getMessagesByRoomRoute({ rabbitMQChannel, redisClient }));
    router.get(
        "/roomId/:roomId/target-message-batch",
        getTargetMessagesBatchByRoom({ redisClient }),
    );
    router.get(
        "/roomId/:roomId/target-message-id-by-date",
        getTargetMessageIdByDate({ redisClient }),
    );

    router.get("/roomId/:roomId/oldest-message-date", getOldestMessageDate({ redisClient }));

    router.post("/delivered", createDeliveredMessageRecordRoute({ rabbitMQChannel }));
    router.post("/:roomId/seen", createSeenMessageRecordRoute({ rabbitMQChannel, redisClient }));

    router.get("/sync/modified/:lastUpdate", getModifiedMessagesSyncRoute({}));
    router.get("/sync/:lastUpdate", getMessagesSyncRoute({}));

    return router;
};
