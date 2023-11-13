import React, { useRef } from "react";
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
    const reactions = useSelector(selectMessageReactions(roomId, id));

    const reactionDuplicateExists = useRef(false);

    if (!reactions || !reactions.length) {
        return null;
    }

    const reactionsToShow: MessageRecordType[] = reactions
        .reduce((acc, curr) => {
            if (curr.isDeleted) return acc;
            if (acc.some((r) => r.reaction === curr.reaction)) {
                if (!reactionDuplicateExists.current) reactionDuplicateExists.current = true;
                return acc;
            } else {
                return [...acc, curr];
            }
        }, [])
        .slice(0, 3);

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
                <Box
                    sx={{
                        display: "flex",
                        ...(isUsersMessage && { flexDirection: "row-reverse" }),
                    }}
                >
                    {(reactions.length > 3 || reactionDuplicateExists.current) && (
                        <Typography sx={{ margin: "6px 2px 0 2px" }} fontSize="0.75rem">
                            {reactions.length}
                        </Typography>
                    )}
                    {reactionsToShow.map((r) => (
                        <Reaction key={r.reaction} emoji={r.reaction} />
                    ))}
                </Box>
            </Stack>
        </Box>
    );
}

type ReactionProps = {
    emoji: string;
};

function Reaction({ emoji }: ReactionProps): React.ReactElement {
    return (
        <>
            <Box p={0.25} flexShrink={0}>
                {emoji}
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
