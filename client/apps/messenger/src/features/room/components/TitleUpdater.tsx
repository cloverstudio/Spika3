// Use this component for updating browser title to avoid rerendering whole page
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import * as utils from "../../../../../../lib/utils";
import { useGetRoomQuery } from "../api/room";
import { selectHistory } from "../slices/leftSidebar";

export default function TitleUpdaterContainer(): React.ReactElement {
    const roomId = parseInt(useParams().id || "");

    if (!roomId) {
        return <HomeTitleUpdater />;
    } else {
        return <TitleUpdater />;
    }
}

function TitleUpdater(): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const { data: room } = useGetRoomQuery(roomId);

    const list = useSelector(selectHistory);
    const name = room?.name || "";

    useEffect(() => {
        const unreadCount: number = list.reduce<number>((totalCount, row) => {
            if (!row.unreadCount || row.muted) {
                return totalCount;
            }

            return totalCount + 1;
        }, 0);

        if (navigator.setAppBadge) {
            if (unreadCount) {
                navigator.setAppBadge(unreadCount);
            } else {
                navigator.clearAppBadge();
            }
        }

        utils.updateBrowserTitle(name, unreadCount);
    }, [name, list]);

    return <></>;
}

export function HomeTitleUpdater(): React.ReactElement {
    const list = useSelector(selectHistory);

    useEffect(() => {
        const unreadCount: number = list.reduce<number>((totalCount, row) => {
            if (!row.unreadCount || row.muted) {
                return totalCount;
            }

            return totalCount + 1;
        }, 0);

        if (navigator.setAppBadge) {
            // The API is supported, use it.
            if (unreadCount) {
                navigator.setAppBadge(unreadCount);
            } else {
                navigator.clearAppBadge();
            }
        }

        utils.updateBrowserTitle("Home", unreadCount);
    }, [list]);

    return <></>;
}
