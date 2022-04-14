import React from "react";
import { Box, Typography } from "@mui/material";

import MessageStatusIcon from "./MessageStatusIcon";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";
import getFileIcon from "../lib/getFileIcon";
import DownloadIcon from "@mui/icons-material/Download";

type MessageProps = {
    id: number;
    fromUserId: number;
    seenCount: number;
    totalUserCount: number;
    deliveredCount: number;
    type: string;
    body: any;
};

declare const UPLOADS_BASE_URL: string;

export default function Message({
    id,
    fromUserId,
    seenCount,
    totalUserCount,
    deliveredCount,
    type,
    body,
}: MessageProps): React.ReactElement {
    const user = useSelector(selectUser);

    const isUsersMessage = user?.id === fromUserId;

    const getStatusIcon = () => {
        if (seenCount === totalUserCount) {
            return "seen";
        }

        if (deliveredCount === totalUserCount) {
            return "delivered";
        }

        return "sent";
    };

    return (
        <Box
            key={id}
            display="flex"
            flexDirection="column"
            alignItems={isUsersMessage ? "end" : "start"}
            textAlign={isUsersMessage ? "right" : "left"}
        >
            {type === "text" && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            {type === "image" && <ImageMessage body={body} isUsersMessage={isUsersMessage} />}
            {type === "video" && <VideoMessage body={body} isUsersMessage={isUsersMessage} />}
            {type === "audio" && <AudioMessage body={body} isUsersMessage={isUsersMessage} />}
            {(type === "file" || type === "unknown") && (
                <FileMessage body={body} isUsersMessage={isUsersMessage} />
            )}
            {isUsersMessage && <MessageStatusIcon status={getStatusIcon()} />}
        </Box>
    );
}

function ImageMessage({ body, isUsersMessage }: { body: any; isUsersMessage: boolean }) {
    if (!body.file) {
        return null;
    }
    return (
        <Box display="flex" flexDirection="column" alignItems={isUsersMessage ? "end" : "start"}>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                component="img"
                borderRadius="0.625rem"
                maxWidth="35rem"
                src={`${UPLOADS_BASE_URL}${body.file.path}`}
                pb="0.8125"
                mb="0.375rem"
            />
        </Box>
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
        <Box display="flex" flexDirection="column" alignItems={isUsersMessage ? "end" : "start"}>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                display="flex"
                alignItems="center"
                borderRadius="0.625rem"
                maxWidth="35rem"
                p="1.25rem"
                mb="0.375rem"
                gap="1.25rem"
                bgcolor={isUsersMessage ? "#C8EBFE" : "#F2F2F2"}
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
        </Box>
    );
}

function VideoMessage({ body, isUsersMessage }: { body: any; isUsersMessage: boolean }) {
    if (!body.file) {
        return null;
    }
    return (
        <Box display="flex" flexDirection="column" alignItems={isUsersMessage ? "end" : "start"}>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                component="video"
                borderRadius="0.625rem"
                maxWidth="35rem"
                controls
                src={`${UPLOADS_BASE_URL}${body.file.path}`}
                pb="0.8125"
                mb="0.375rem"
            />
        </Box>
    );
}

function AudioMessage({ body, isUsersMessage }: { body: any; isUsersMessage: boolean }) {
    if (!body.file) {
        return null;
    }
    return (
        <Box display="flex" flexDirection="column" alignItems={isUsersMessage ? "end" : "start"}>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                component="audio"
                controls
                borderRadius="0.625rem"
                maxWidth="35rem"
                pb="0.8125"
                mb="0.375rem"
            >
                <source type={body.file.type} src={`${UPLOADS_BASE_URL}${body.file.path}`} />
            </Box>
        </Box>
    );
}

function TextMessage({ isUsersMessage, body }: { isUsersMessage: boolean; body: any }) {
    return (
        <Box
            maxWidth="35rem"
            bgcolor={isUsersMessage ? "#C8EBFE" : "#F2F2F2"}
            borderRadius="0.625rem"
            p="0.625rem"
            mb="0.375rem"
            width="max-content"
        >
            <Typography fontWeight={500} fontSize="0.875rem" color="#131940" lineHeight="1.0625rem">
                {body.text}
            </Typography>
        </Box>
    );
}
