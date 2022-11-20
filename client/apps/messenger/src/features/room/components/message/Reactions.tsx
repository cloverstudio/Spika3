import React, { useState } from "react";
import { Box, Popover, Stack, Typography } from "@mui/material";

import { MessageRecordType } from "../../../../types/Message";
import { useGetUserByIdQuery } from "../../api/user";
import { useSelector } from "react-redux";
import { selectMessageReactions } from "../../slices/messages";
import { useParams } from "react-router-dom";
import useIsUsersMessage from "../../hooks/useIsUsersMessage";

type MessageReactionsProps = {
    id: number;
};

export default function MessageReactions({ id }: MessageReactionsProps): React.ReactElement {
    const roomId = parseInt(useParams().id || "");

    const isUsersMessage = useIsUsersMessage(roomId, id);
    const reactions = useSelector(selectMessageReactions(roomId, id));
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const messageRecordsByReaction: { [key: string]: MessageRecordType[] } = reactions.reduce(
        (acc, curr) => {
            if (acc[curr.reaction]) {
                acc[curr.reaction].push(curr);
            } else {
                acc[curr.reaction] = [curr];
            }
            return acc;
        },
        {}
    );

    if (!reactions.length) {
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
            bottom={0}
            sx={{
                ...(isUsersMessage ? { left: 0 } : { right: 0 }),
            }}
        >
            <Stack
                direction="row"
                bgcolor={isUsersMessage ? "common.myMessageBackground" : "common.chatBackground"}
                position="relative"
                top="23px"
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
                    {reactions.map((r) => (
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
