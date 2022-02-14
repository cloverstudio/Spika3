import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, Badge, Box, Typography } from "@mui/material";

import { useGetHistoryQuery } from "../api/room";

import { selectUser } from "../../../store/userSlice";
import { selectActiveRoomId } from "../slice/chatSlice";
import { selectHistory } from "../slice/roomSlice";

import useIsInViewport from "../../../hooks/useIsInViewport";

import formatRoomInfo from "../lib/formatRoomInfo";
import { LastMessage } from "../../../types/Rooms";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function SidebarContactList(): React.ReactElement {
    const { list, count } = useSelector(selectHistory);
    const [page, setPage] = useState(1);
    const { isFetching } = useGetHistoryQuery(page);
    const { isInViewPort, elementRef } = useIsInViewport();
    const activeRoomId = useSelector(selectActiveRoomId);
    const user = useSelector(selectUser);

    const hasMoreContactsToLoad = count > list.length;

    useEffect(() => {
        if (isInViewPort && !isFetching && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
        }
    }, [isInViewPort, isFetching, hasMoreContactsToLoad]);

    if (!list.length && !isFetching) {
        return <Typography>No rooms</Typography>;
    }

    return (
        <Box sx={{ overflowY: "auto" }}>
            {list.map((room) => {
                const formattedRoom = formatRoomInfo(room, user.id);
                return (
                    <RoomRow key={room.id} {...formattedRoom} isActive={room.id === activeRoomId} />
                );
            })}
            <div ref={elementRef}></div>
        </Box>
    );
}

type RoomRowProps = {
    id: number;
    name: string;
    isActive: boolean;
    lastMessage?: LastMessage;
    avatarUrl?: string;
};

function RoomRow({ id, isActive, name, avatarUrl, lastMessage }: RoomRowProps) {
    return (
        <Link to={`/rooms/${id}`} style={{ textDecoration: "none" }}>
            <Box bgcolor={isActive ? "#E5F4FF" : "#fff"} px={2.5} py={1.5} display="flex">
                <Avatar alt={name} sx={{ width: 50, height: 50 }} src={avatarUrl} />
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    ml={2}
                    flexGrow={1}
                >
                    <Box flexGrow={1}>
                        <Typography
                            mb={1}
                            fontWeight="600"
                            fontSize="0.875rem"
                            lineHeight="1.0625rem"
                        >
                            {name}
                        </Typography>
                        <Typography color="#4A4A4A" fontSize="0.875rem" lineHeight="1.0625rem">
                            {lastMessage.messageBody?.text || "No messages"}
                        </Typography>
                    </Box>
                    <Box textAlign="right">
                        <Typography
                            mb={1}
                            color="#9AA0A6"
                            fontWeight="500"
                            fontSize="0.75rem"
                            lineHeight="1rem"
                        >
                            {dayjs(lastMessage.createdAt).fromNow()}
                        </Typography>
                        <Badge
                            sx={{
                                "& .MuiBadge-badge": {
                                    position: "relative",
                                    transform: "none",
                                },
                            }}
                            color="primary"
                            badgeContent={999}
                            max={99}
                        />
                    </Box>
                </Box>
            </Box>
        </Link>
    );
}
