import React, { useState } from "react";
import { Avatar, Box, Dialog, ListItemAvatar, Skeleton, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import {
    hideEmojiDetails,
    selectActiveMessage,
    selectShowEmojiDetails,
} from "../../slices/messages";
import { useParams } from "react-router-dom";
import { useGetUserByIdQuery } from "../../api/user";
import { useGetMessageRecordsByIdQuery, useRemoveReactionMutation } from "../../api/message";
import { selectUser } from "../../../../store/userSlice";
import { useTheme } from "@mui/material/styles";
import useStrings from "../../../../hooks/useStrings";

export default function EmojiModalContainer() {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useAppDispatch();

    const activeMessage = useAppSelector(selectActiveMessage(roomId));
    const showEmojiDetails = useAppSelector(selectShowEmojiDetails(roomId));

    if (!activeMessage || !showEmojiDetails) {
        return null;
    }

    const closeDialog = () => {
        dispatch(hideEmojiDetails(roomId));
    };

    return (
        <EmojiModal
            messageId={activeMessage.id}
            showEmojiDetails={showEmojiDetails}
            onClose={closeDialog}
        />
    );
}

interface EmojiModalProps {
    messageId: number;
    onClose: () => void;
    showEmojiDetails: boolean;
}

function EmojiModal({ messageId, onClose, showEmojiDetails }: EmojiModalProps) {
    const { data } = useGetMessageRecordsByIdQuery(
        { messageId, recordType: "reaction" },
        { refetchOnMountOrArgChange: true },
    );

    const strings = useStrings();

    const [selectedEmoji, setSelectedEmoji] = useState<string>(strings.all);

    const user = useAppSelector(selectUser);

    const theme = useTheme();
    const isDarkTheme = theme.palette.mode === "dark";

    const reactionsByPeople: {
        [reaction: string]: { id: number; userIds: number[]; count: number };
    } = {};

    if (!data) return null;

    const messageRecords = [...data.messageRecords];

    const indexOfMyReactionRecord = messageRecords.findIndex((r) => r.userId === user.id);

    if (indexOfMyReactionRecord !== -1) {
        const myReactionRecord = messageRecords[indexOfMyReactionRecord];
        messageRecords.splice(indexOfMyReactionRecord, 1);
        messageRecords.unshift(myReactionRecord);
    }

    messageRecords.forEach((r) => {
        if (r.type !== "reaction" || r.isDeleted) return;

        if (reactionsByPeople[r.reaction]) {
            reactionsByPeople[r.reaction].userIds.push(r.userId);
            reactionsByPeople[r.reaction].count++;
        } else {
            reactionsByPeople[r.reaction] = {
                id: r.id,
                userIds: [r.userId],
                count: 1,
            };
        }
    });

    if (messageRecords.filter((r) => r.type === "reaction" && !r.isDeleted).length === 0) onClose();

    return (
        <Dialog
            open={showEmojiDetails}
            onKeyDown={(e) => {
                if (e.key === "Escape") onClose();
            }}
            onClose={onClose}
            maxWidth="xs"
            sx={{
                "& .MuiDialog-paper": {
                    width: "360px",
                    height: "324px",
                    backgroundColor: isDarkTheme ? "default" : "#fff",
                },
            }}
        >
            <Box
                sx={{
                    padding: "8px 0px 11px 20px",
                    borderRadius: "10px",
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
                    overflowX: "hidden",
                    overflowY: "hidden",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: "14px",
                        padding: "16px 0px 16px 0px",
                        overflowX: "auto",
                        marginRight: "20px",
                    }}
                >
                    <Box
                        sx={{
                            "&:hover": {
                                cursor: "pointer",
                                backgroundColor: "common.otherMessageBackground",
                            },
                            backgroundColor:
                                selectedEmoji === strings.all
                                    ? "common.otherMessageBackground"
                                    : "transparent",
                            borderRadius: "4px",
                            color: "primary.main",
                            fontWeight: 500,
                            padding: "4px 6px",
                        }}
                        onClick={() => setSelectedEmoji(strings.all)}
                    >
                        {strings.all}
                    </Box>
                    {Object.keys(reactionsByPeople).map((r) => {
                        return (
                            <EmojiModalHeader
                                emoji={r}
                                count={reactionsByPeople[r].count}
                                key={r}
                                setSelectedEmoji={setSelectedEmoji}
                                selectedEmoji={selectedEmoji}
                            />
                        );
                    })}
                </Box>
                <Box
                    sx={{
                        overflowY: "auto",
                        height: "260px",
                    }}
                >
                    <Box sx={{ pr: "14px", pb: "14px" }}>
                        {selectedEmoji !== strings.all
                            ? reactionsByPeople[selectedEmoji]?.userIds.map((userId) => {
                                  return (
                                      <EmojiModalBody
                                          userId={userId}
                                          key={userId}
                                          emoji={selectedEmoji}
                                          messageRecordId={reactionsByPeople[selectedEmoji].id}
                                          onReactionRemove={onClose}
                                      />
                                  );
                              })
                            : Object.keys(reactionsByPeople).map((r) =>
                                  reactionsByPeople[r].userIds.map((userId) => {
                                      return (
                                          <EmojiModalBody
                                              userId={userId}
                                              key={userId}
                                              emoji={r}
                                              messageRecordId={reactionsByPeople[r].id}
                                              onReactionRemove={onClose}
                                          />
                                      );
                                  }),
                              )}
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}

function EmojiModalBody({
    userId,
    emoji,
    messageRecordId,
    onReactionRemove,
}: {
    userId: number;
    emoji: string;
    messageRecordId: number;
    onReactionRemove: () => void;
}) {
    const strings = useStrings();
    const { data, isLoading } = useGetUserByIdQuery(userId);

    const user = useAppSelector(selectUser);

    const isUsersEmoji = user.id === userId;
    const [removeReaction] = useRemoveReactionMutation();

    const removeReactionHandler = () => {
        removeReaction({ messageRecordId: messageRecordId });
        onReactionRemove();
    };

    if (isLoading) return null;

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "64px",
            }}
        >
            <Box sx={{ display: "flex", gap: "16px" }}>
                <ListItemAvatar>
                    {isLoading ? (
                        <Skeleton variant="circular" width={40} height={40} />
                    ) : (
                        <Avatar
                            sx={{ width: "42px", height: "42px" }}
                            alt={data.user.displayName}
                            src={`${UPLOADS_BASE_URL}/${data.user.avatarFileId}`}
                        />
                    )}
                </ListItemAvatar>
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "text.primary" }}>
                        {isUsersEmoji ? "You" : data.user.displayName}
                    </Typography>
                    {isUsersEmoji && (
                        <Typography
                            sx={{
                                fontSize: "12px",
                                color: "text.primary",
                                "&:hover": { cursor: "pointer" },
                            }}
                            onClick={removeReactionHandler}
                        >
                            {strings.clickToRemove}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Typography sx={{ fontSize: "30px" }}>{emoji}</Typography>
        </Box>
    );
}

function EmojiModalHeader({
    emoji,
    count,
    setSelectedEmoji,
    selectedEmoji,
}: {
    emoji: string;
    count: number;
    setSelectedEmoji: (emoji: string) => void;
    selectedEmoji: string;
}) {
    return (
        <Box
            sx={{
                "&:hover": {
                    cursor: "pointer",
                    backgroundColor: "common.otherMessageBackground",
                },
                backgroundColor:
                    selectedEmoji === emoji ? "common.otherMessageBackground" : "transparent",
                borderRadius: "4px",
                color: "text.primary",
                fontWeight: 500,
                padding: "4px 6px",
                display: "flex",
                gap: "4px",
            }}
            onClick={() => setSelectedEmoji(emoji)}
        >
            {emoji} <span>{count}</span>
        </Box>
    );
}
