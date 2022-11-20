// Use this component for updating browser title to avoid rerendering whole page
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import * as utils from "../../../../../../lib/utils";
import { useGetRoomQuery } from "../api/room";
import { selectHistory } from "../slices/leftSidebar";

export default function TitleUpdater(): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const { data: room } = useGetRoomQuery(roomId);

    const { list } = useSelector(selectHistory);
    const name = room?.name || "";

    useEffect(() => {
        const unreadCount: number = list.reduce<number>((totalCount, row) => {
            if (row.unreadCount) return totalCount + row.unreadCount;
            else return totalCount;
        }, 0);

        utils.updateBrowserTitle(name, unreadCount);
    }, [name, list]);

    return <></>;
}
