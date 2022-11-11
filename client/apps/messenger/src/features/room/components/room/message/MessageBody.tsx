import React, { useState } from "react";
import { Box, Modal, Typography } from "@mui/material";

import getFileIcon from "../../../lib/getFileIcon";
import DownloadIcon from "@mui/icons-material/Download";
import { CloseOutlined } from "@mui/icons-material";
import { deletedMessageText } from "../../../lib/consts";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import UserType from "../../../../../types/User";
import { useGetRoom2Query } from "../../../api/room";

declare const UPLOADS_BASE_URL: string;

type MessageBodyProps = {
    id: number;
    type: string;
    body: any;
    side: "left" | "right";
    isReply?: boolean;
    onImageMessageClick?: () => void;
};

export default function MessageBody({
    type,
    body,
    side,
    isReply,
    onImageMessageClick,
}: MessageBodyProps): React.ReactElement {
    const isDeleted = body?.text === deletedMessageText;

    if (isDeleted) {
        return <TextMessage body={body} isUsersMessage={side === "right"} />;
    }

    if (isReply) {
        return <ReplyMessage body={body} isUsersMessage={side === "right"} />;
    }

    switch (type) {
        case "text": {
            return <TextMessage body={body} isUsersMessage={side === "right"} />;
        }

        case "image": {
            return (
                <ImageMessage
                    body={body}
                    isUsersMessage={side === "right"}
                    onClick={onImageMessageClick}
                />
            );
        }

        case "video": {
            return <VideoMessage body={body} isUsersMessage={side === "right"} />;
        }

        case "audio": {
            return <AudioMessage body={body} isUsersMessage={side === "right"} />;
        }

        default: {
            return <FileMessage body={body} isUsersMessage={side === "right"} />;
        }
    }
}

function ImageMessage({
    body,
    isUsersMessage,
    onClick,
}: {
    body: any;
    isUsersMessage: boolean;
    onClick: () => void;
}) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
        onClick();
    };
    const handleClose = () => setOpen(false);

    if (!body.file) {
        return null;
    }

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "transparent",
        outline: "none",
        lineHeight: "1",
    };

    return (
        <>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                onClick={handleOpen}
                component="img"
                borderRadius="0.625rem"
                maxWidth="256px"
                height="auto"
                width="100%"
                src={`${API_BASE_URL}/upload/files/${body.thumbId}`}
                pb="0.8125"
                sx={{ cursor: "pointer", objectFit: "contain" }}
            />
            <Modal open={open} onClose={handleClose}>
                <>
                    <Box textAlign="right" mr={2} mt={2}>
                        <CloseOutlined
                            onClick={handleClose}
                            sx={{ color: "white", cursor: "pointer" }}
                            fontSize="large"
                        />
                    </Box>

                    <Box sx={style}>
                        <Box
                            onClick={handleOpen}
                            component="img"
                            maxWidth="92vw"
                            maxHeight="92vh"
                            height="auto"
                            src={`${API_BASE_URL}/upload/files/${body.fileId}`}
                        />
                    </Box>
                </>
            </Modal>
        </>
    );
}

function FileMessage({ body, isUsersMessage }: { body: any; isUsersMessage: boolean }) {
    if (!body.file) {
        return null;
    }

    const file = body.file;
    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    const sizeInKB = (file.size / 1024).toFixed(2);

    const Icon = getFileIcon(file.mimeType);
    return (
        <>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                display="flex"
                alignItems="center"
                borderRadius="0.625rem"
                maxWidth="35rem"
                p="1.25rem"
                gap="1.25rem"
                bgcolor={isUsersMessage ? "common.myMessageBackground" : "common.chatBackground"}
            >
                <Icon fontSize="large" />
                <Box>
                    <Typography fontSize="1rem" fontWeight={800} lineHeight="1.1rem" mb={0.25}>
                        {file.fileName}
                    </Typography>
                    <Typography textAlign="left">
                        {+sizeInMB > 0 ? `${sizeInMB} MB` : `${sizeInKB} KB`}
                    </Typography>
                </Box>
                <Box
                    component="a"
                    href={`${API_BASE_URL}/upload/files/${body.fileId}`}
                    target="_blank"
                    download
                    sx={{ display: "block", color: "inherit" }}
                >
                    <DownloadIcon fontSize="large" />
                </Box>
            </Box>
        </>
    );
}

function VideoMessage({ body, isUsersMessage }: { body: any; isUsersMessage: boolean }) {
    if (!body.file) {
        return null;
    }

    return (
        <>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                component="video"
                borderRadius="0.625rem"
                maxWidth="35rem"
                controls
                src={`${API_BASE_URL}/upload/files/${body.fileId}`}
                pb="0.8125"
            />
        </>
    );
}

function AudioMessage({ body, isUsersMessage }: { body: any; isUsersMessage: boolean }) {
    if (!body.file) {
        return null;
    }

    return (
        <>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box component="audio" controls borderRadius="0.625rem" maxWidth="35rem" pb="0.8125">
                <source type={body.file.type} src={`${API_BASE_URL}/upload/files/${body.fileId}`} />
            </Box>
        </>
    );
}

function ReplyMessage({ isUsersMessage, body }: { body: any; isUsersMessage: boolean }) {
    const navigate = useNavigate();
    const roomId = parseInt(useParams().id || "");
    const { data: room } = useGetRoom2Query(roomId);

    const renderReplyMessage = () => {
        const { type: replyMsgType, body: replyMsgBody } = body.referenceMessage;

        const sender = room?.users?.find(
            (u) => u.userId === body.referenceMessage.fromUserId
        )?.user;
        switch (replyMsgType) {
            case "text": {
                return (
                    <TextMessage
                        body={replyMsgBody}
                        isUsersMessage={!isUsersMessage}
                        sender={sender}
                    />
                );
            }

            case "image": {
                return (
                    <Box
                        sx={{
                            backgroundColor: !isUsersMessage
                                ? "common.myMessageBackground"
                                : "common.chatBackground",
                            borderRadius: "0.3rem",
                            padding: "0.4rem",
                            cursor: "pointer",
                            color: "common.darkBlue",
                        }}
                    >
                        {sender && (
                            <Box mb={0.75} fontWeight="medium">
                                {sender.displayName}
                            </Box>
                        )}
                        <ImageMessage
                            body={replyMsgBody}
                            isUsersMessage={!isUsersMessage}
                            onClick={() => true}
                        />
                    </Box>
                );
            }

            case "video": {
                return (
                    <Box
                        sx={{
                            backgroundColor: !isUsersMessage
                                ? "common.myMessageBackground"
                                : "common.chatBackground",
                            borderRadius: "0.3rem",
                            padding: "0.4rem",
                            cursor: "pointer",
                            color: "common.darkBlue",
                        }}
                    >
                        {sender && (
                            <Box mb={0.75} fontWeight="medium">
                                {sender.displayName}
                            </Box>
                        )}
                        <VideoMessage body={replyMsgBody} isUsersMessage={!isUsersMessage} />
                    </Box>
                );
            }

            case "audio": {
                return (
                    <Box
                        sx={{
                            backgroundColor: !isUsersMessage
                                ? "common.myMessageBackground"
                                : "common.chatBackground",
                            borderRadius: "0.3rem",
                            padding: "0.4rem",
                            cursor: "pointer",
                            color: "common.darkBlue",
                        }}
                    >
                        {sender && (
                            <Box mb={0.75} fontWeight="medium">
                                {sender.displayName}
                            </Box>
                        )}
                        <AudioMessage body={replyMsgBody} isUsersMessage={!isUsersMessage} />
                    </Box>
                );
            }

            default: {
                return (
                    <Box
                        sx={{
                            backgroundColor: !isUsersMessage
                                ? "common.myMessageBackground"
                                : "common.chatBackground",
                            borderRadius: "0.3rem",
                            padding: "0.4rem",
                            cursor: "pointer",
                            color: "common.darkBlue",
                        }}
                    >
                        {sender && (
                            <Box mb={0.75} fontWeight="medium">
                                {sender.displayName}
                            </Box>
                        )}
                        <FileMessage body={replyMsgBody} isUsersMessage={!isUsersMessage} />
                    </Box>
                );
            }
        }
    };

    const handleReplyClick = () => {
        navigate(`/rooms/${roomId}/${body.referenceMessage.id}`);
    };
    return (
        <Box
            component={"div"}
            sx={{
                minWidth: "50px",
                maxWidth: "50rem",
                backgroundColor: isUsersMessage
                    ? "common.myMessageBackground"
                    : "common.chatBackground",
                borderRadius: "0.3rem",
                padding: "0.4rem",
                cursor: "pointer",
                color: "common.darkBlue",
                lineHeight: "1.2rem",
                whiteSpace: "pre-wrap",
                margin: "0px",
                fontSize: "0.95rem",
            }}
        >
            <Box mb="0.4rem" onClick={handleReplyClick}>
                {renderReplyMessage()}
            </Box>

            <Box>{body.text}</Box>
        </Box>
    );
}

function TextMessage({
    isUsersMessage,
    body,
    sender,
}: {
    body: any;
    isUsersMessage: boolean;
    sender?: UserType;
}) {
    const filterText = (text: string): string => {
        // escape html
        text = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        // fold multiple new line in one
        text = text.replace(/\n{3,}/g, "\n");

        // auto link
        const autolinkRegex = /(?![^<]*>|[^<>]*<\/)((https?:)\/\/[a-z0-9&#%;:=.\/\-?_]+)/gi;
        const internalLink = text.includes(window.origin);

        text = text.replace(
            autolinkRegex,
            `<a href="$1" ${!internalLink ? 'target="_blank"' : ""} >$1</a>`
        );

        return text;
    };

    return (
        <Box
            component={"div"}
            sx={{
                minWidth: "50px",
                maxWidth: "100%",
                backgroundColor: isUsersMessage
                    ? "common.myMessageBackground"
                    : "common.chatBackground",
                borderRadius: "0.3rem",
                padding: "0.4rem",
                cursor: "pointer",
                color: "common.darkBlue",
                lineHeight: "1.2rem",
                whiteSpace: "pre-wrap",
                margin: "0px",
                fontSize: "0.95rem",
            }}
        >
            {sender && (
                <Box mb={1} fontWeight="medium">
                    {sender.displayName}
                </Box>
            )}
            <Box
                sx={{ overflowWrap: "break-word" }}
                dangerouslySetInnerHTML={{ __html: filterText(body.text) }}
            />
        </Box>
    );
}
