// Use this component for updating browser title to avoid rerendering whole page
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as constants from "../../../../../../lib/constants";
import * as utils from "../../../../../../lib/utils";
import { fetchHistory, selectHistory, selectHistoryLoading } from "../slice/roomSlice";

type Props = {
    name: string;
    roomId: number;
};

export default function TitleUpdater({ name }: Props): React.ReactElement {
    const { list, count } = useSelector(selectHistory);

    const updateTitle = () => {
        const unreadCount: number = list.reduce<number>((totalCount, row) => {
            if (row.unreadCount) return totalCount + row.unreadCount;
            else return totalCount;
        }, 0);

        utils.updateBrowserTitle(name, unreadCount);
    };

    useEffect(() => {
        updateTitle();
    }, [name]);

    useEffect(() => {
        updateTitle();
    }, [list]);

    return <></>;
}
