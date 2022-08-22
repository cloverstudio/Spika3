import React, { useState } from "react";
import { Box, Modal, Typography } from "@mui/material";

import getFileIcon from "../lib/getFileIcon";
import DownloadIcon from "@mui/icons-material/Download";
import { CloseOutlined, Info } from "@mui/icons-material";
import { deletedMessageText } from "../lib/consts";

declare const UPLOADS_BASE_URL: string;

type MessageBodyProps = {
    id: number;
    type: string;
    body: any;
    isUsersMessage: boolean;
    onMessageClick?: (e: any) => void;
};

export default function MessageBody({
    type,
    body,
    isUsersMessage,
    onMessageClick,
}: MessageBodyProps): React.ReactElement {
    const isDeleted = body?.text === deletedMessageText;

    if (isDeleted) {
        return <TextMessage body={body} isUsersMessage={isUsersMessage} onClick={onMessageClick} />;
    }

    switch (type) {
        case "text": {
            return (
                <TextMessage body={body} isUsersMessage={isUsersMessage} onClick={onMessageClick} />
            );
        }

        case "image": {
            return (
                <ImageMessage
                    body={body}
                    isUsersMessage={isUsersMessage}
                    onClickContextMenu={onMessageClick}
                />
            );
        }

        case "video": {
            return (
                <VideoMessage
                    body={body}
                    isUsersMessage={isUsersMessage}
                    onClick={onMessageClick}
                />
            );
        }

        case "audio": {
            return (
                <AudioMessage
                    body={body}
                    isUsersMessage={isUsersMessage}
                    onClick={onMessageClick}
                />
            );
        }

        default: {
            return (
                <FileMessage body={body} isUsersMessage={isUsersMessage} onClick={onMessageClick} />
            );
        }
    }
}

function ImageMessage({
    body,
    isUsersMessage,
    onClickContextMenu,
}: {
    body: any;
    isUsersMessage: boolean;
    onClickContextMenu: (e: any) => void;
}) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
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
            {body.text && (
                <TextMessage
                    body={body}
                    isUsersMessage={isUsersMessage}
                    onClick={onClickContextMenu}
                />
            )}
            <Box
                onClick={handleOpen}
                component="img"
                borderRadius="0.625rem"
                maxWidth="35rem"
                height="10rem"
                width="auto"
                src={`${UPLOADS_BASE_URL}${body.thumb.path}`}
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
                        <Info
                            onClick={onClickContextMenu}
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
                            src={`${UPLOADS_BASE_URL}${body.file.path}`}
                        />
                    </Box>
                </>
            </Modal>
        </>
    );
}

function FileMessage({
    body,
    isUsersMessage,
    onClick,
}: {
    body: any;
    isUsersMessage: boolean;
    onClick: (e: any) => void;
}) {
    if (!body.file) {
        return null;
    }

    const file = body.file;
    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    const sizeInKB = (file.size / 1024).toFixed(2);

    const Icon = getFileIcon(file.mimeType);
    return (
        <>
            {body.text && (
                <TextMessage body={body} isUsersMessage={isUsersMessage} onClick={onClick} />
            )}
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
                    href={`${UPLOADS_BASE_URL}${file.path}`}
                    download
                    sx={{ display: "block", color: "inherit" }}
                >
                    <DownloadIcon fontSize="large" />
                </Box>
            </Box>
        </>
    );
}

function VideoMessage({
    body,
    isUsersMessage,
    onClick,
}: {
    body: any;
    isUsersMessage: boolean;
    onClick: (e: any) => void;
}) {
    if (!body.file) {
        return null;
    }

    return (
        <>
            {body.text && (
                <TextMessage body={body} isUsersMessage={isUsersMessage} onClick={onClick} />
            )}
            <Box
                component="video"
                borderRadius="0.625rem"
                maxWidth="35rem"
                controls
                src={`${UPLOADS_BASE_URL}${body.file.path}`}
                pb="0.8125"
            />
        </>
    );
}

function AudioMessage({
    body,
    isUsersMessage,
    onClick,
}: {
    body: any;
    isUsersMessage: boolean;
    onClick: (e: any) => void;
}) {
    if (!body.file) {
        return null;
    }

    return (
        <>
            {body.text && (
                <TextMessage body={body} isUsersMessage={isUsersMessage} onClick={onClick} />
            )}
            <Box component="audio" controls borderRadius="0.625rem" maxWidth="35rem" pb="0.8125">
                <source type={body.file.type} src={`${UPLOADS_BASE_URL}${body.file.path}`} />
            </Box>
        </>
    );
}

function TextMessage({
    isUsersMessage,
    body,
    onClick,
}: {
    body: any;
    isUsersMessage: boolean;
    onClick: (e: any) => void;
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
        const autolinkRegex = /(?![^<]*>|[^<>]*<\/)((https?:)\/\/[a-z0-9&#=.\/\-?_]+)/gi;
        text = text.replace(autolinkRegex, '<a href="$1" target="_blank">$1</a>');

        return text;
    };

    return (
        <Box
            component={"pre"}
            sx={{
                minWidth: "50px",
                maxWidth: "50rem",
                backgroundColor: isUsersMessage
                    ? "common.myMessageBackground"
                    : "common.chatBackground",
                borderRadius: "1rem",
                padding: "0.75rem",
                cursor: "pointer",
                color: "common.darkBlue",
                lineHeight: "1.5rem",
                whiteSpace: "pre-wrap",
                margin: "0px",
            }}
            dangerouslySetInnerHTML={{ __html: filterText(body.text) }}
            onClick={onClick}
        />
    );
}
