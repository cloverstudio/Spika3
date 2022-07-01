import React, { useState } from "react";
import { Box, Popover, Stack, Typography } from "@mui/material";

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
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            justifyContent={isUsersMessage ? "flex-end" : "flex-start"}
            position="absolute"
            sx={{
                ...(isUsersMessage ? { left: 0 } : { right: 0 }),
            }}
        >
            <Stack
                direction="row"
                bgcolor={isUsersMessage ? "common.myMessageBackground" : "common.chatBackground"}
                position="relative"
                bottom="22px"
                p={0.375}
                sx={{
                    borderRadius: "1rem",
                    border: "1px solid white",
                    cursor: "default",
                }}
            >
                {Object.entries(messageRecordsByReaction).map(([emoji, reactions]) => {
                    return <Reaction key={emoji} emoji={emoji} reactions={reactions} />;
                })}
            </Stack>
            <Popover
                id="reaction-users"
                open={open}
                anchorEl={anchorEl}
                onClose={handleMouseLeave}
                anchorOrigin={{
                    vertical: 32,
                    horizontal: isUsersMessage ? "left" : "center",
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
                <Box p={0.5}>
                    {messageReactions.map((r) => (
                        <ReactionUser key={r.userId} userId={r.userId} reaction={r.reaction} />
                    ))}
                </Box>
            </Popover>
        </Box>
    );
}

type ReactionProps = {
    emoji: string;
    reactions: MessageRecordType[];
};

function Reaction({ emoji, reactions }: ReactionProps): React.ReactElement {
    return (
        <>
            <Box p={0.25}>
                {emoji}{" "}
                {reactions.length > 1 ? (
                    <Typography ml={-0.5} display="inline" fontSize="0.75rem">
                        {reactions.length}
                    </Typography>
                ) : (
                    ""
                )}
            </Box>
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
        <Typography key={userId} sx={{ px: 1, py: 0.5 }}>
            {reaction} {userData?.user.displayName}
        </Typography>
    );
}
