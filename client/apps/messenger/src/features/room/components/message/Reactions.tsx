import React, { useState } from "react";
import { Box } from "@mui/material";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MessageRecordType } from "../../../../types/Message";
import { useGetUserByIdQuery } from "../../api/user";
import { useSelector } from "react-redux";
import { selectMessageReactions, showEmojiDetails } from "../../slices/messages";
import { useParams } from "react-router-dom";
import useIsUsersMessage from "../../hooks/useIsUsersMessage";
import { useAppDispatch } from "../../../../hooks";

type MessageReactionsProps = {
    id: number;
};

export default function MessageReactions({ id }: MessageReactionsProps): React.ReactElement {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useAppDispatch();

    const isUsersMessage = useIsUsersMessage(roomId, id);
    const reactions = useSelector(selectMessageReactions(roomId, id))?.filter(
        (reaction) => !reaction.isDeleted,
    );

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    if (!reactions || !reactions.length) {
        return null;
    }

    const messageRecordsByReaction: { [key: string]: MessageRecordType[] } = reactions.reduce(
        (acc, curr) => {
            if (acc[curr.reaction]) {
                acc[curr.reaction].push(curr);
            } else {
                acc[curr.reaction] = [curr];
            }
            return acc;
        },
        {},
    );

    if (!reactions.length) {
        return null;
    }

    const handleEmojiClick = () => {
        dispatch(showEmojiDetails({ roomId, messageId: id }));
    };

    return (
        <Box
            display="flex"
            alignItems="end"
            justifyContent={isUsersMessage ? "flex-end" : "flex-start"}
            position="absolute"
            bottom={0}
            zIndex={1}
            sx={{
                ...(isUsersMessage ? { right: 18 } : { left: 0 }),
            }}
        >
            <Stack
                flexShrink={0}
                direction="row"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                bgcolor={isUsersMessage ? "common.myMessageBackground" : "background.paper"}
                position="relative"
                top="23px"
                px={0.75}
                sx={{
                    borderRadius: "1rem",
                    border: "1px solid",
                    borderColor: "divider",
                    cursor: "default",
                    "&:hover": {
                        cursor: "pointer",
                    },
                }}
                onClick={handleEmojiClick}
            >
                {Object.entries(messageRecordsByReaction).map(([emoji, reactions]) => {
                    return <Reaction key={emoji} emoji={emoji} reactions={reactions} />;
                })}
            </Stack>
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
            <Box p={0.25} flexShrink={0}>
                {emoji}{" "}
                {reactions.length > 1 ? (
                    <Typography ml={-0.25} display="inline" fontSize="0.75rem">
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
