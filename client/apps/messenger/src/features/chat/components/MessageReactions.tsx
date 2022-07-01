import React, { useState } from "react";
import { Box, Popover, Typography } from "@mui/material";

import { useGetMessageRecordsByIdQuery } from "../api/message";
import { MessageRecordType } from "../../../types/Message";
import { useGetUserByIdQuery } from "../api/user";

type MessageReactionsProps = {
    isUsersMessage: boolean;
    id: number;
};

export default function MessageReactions({
    isUsersMessage,
    id,
}: MessageReactionsProps): React.ReactElement {
    const { data: messageRecordsData } = useGetMessageRecordsByIdQuery(id);
    const messageReactions =
        messageRecordsData?.messageRecords.filter((mr) => mr.type === "reaction") || [];

    const messageRecordsByReaction: { [key: string]: MessageRecordType[] } =
        messageReactions.reduce((acc, curr) => {
            if (acc[curr.reaction]) {
                acc[curr.reaction].push(curr);
            } else {
                acc[curr.reaction] = [curr];
            }
            return acc;
        }, {});

    if (!messageReactions.length) {
        return null;
    }

    return (
        <Box
            display="flex"
            alignItems="end"
            justifyContent={isUsersMessage ? "flex-end" : "flex-start"}
        >
            <Box
                bgcolor={isUsersMessage ? "common.myMessageBackground" : "common.chatBackground"}
                display="inline-flex"
                position="relative"
                bottom="15px"
                left={isUsersMessage ? "-20px" : "36px"}
                sx={{
                    borderRadius: "1rem",
                    padding: "5px 10px",
                    border: "1px solid white",
                    cursor: "default",
                }}
            >
                {Object.entries(messageRecordsByReaction).map(([emoji, reactions]) => {
                    return <Reaction key={emoji} emoji={emoji} reactions={reactions} />;
                })}
            </Box>
        </Box>
    );
}

type ReactionProps = {
    emoji: string;
    reactions: MessageRecordType[];
};

function Reaction({ emoji, reactions }: ReactionProps): React.ReactElement {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <Box pr={0.75} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {emoji}{" "}
                {reactions.length > 1 ? (
                    <Typography ml={-0.5} display="inline" fontSize="0.75rem">
                        {reactions.length}
                    </Typography>
                ) : (
                    ""
                )}
            </Box>
            <Popover
                id="reaction-users"
                open={open}
                anchorEl={anchorEl}
                onClose={handleMouseLeave}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                sx={{
                    pointerEvents: "none",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                disableRestoreFocus
            >
                {reactions.map((r) => (
                    <ReactionUser key={r.userId} userId={r.userId} reaction={emoji} />
                ))}
            </Popover>
        </>
    );
}

type ReactionUserProps = {
    userId: number;
    reaction: string;
};

function ReactionUser({ userId, reaction }: ReactionUserProps): React.ReactElement {
    const { data: userData } = useGetUserByIdQuery(userId);

    return (
        <Typography key={userId} sx={{ px: 2, py: 1 }}>
            {reaction} {userData?.user.displayName}
        </Typography>
    );
}
