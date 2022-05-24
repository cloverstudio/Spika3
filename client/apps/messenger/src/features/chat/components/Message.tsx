import React, { useState } from "react";
import { Avatar, Box, Modal, Typography } from "@mui/material";

import MessageStatusIcon from "./MessageStatusIcon";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";
import getFileIcon from "../lib/getFileIcon";
import DownloadIcon from "@mui/icons-material/Download";
import { useGetRoomQuery } from "../api/room";
import { useParams } from "react-router-dom";
import { CloseOutlined } from "@mui/icons-material";

type MessageProps = {
    id: number;
    fromUserId: number;
    seenCount: number;
    totalUserCount: number;
    deliveredCount: number;
    type: string;
    body: any;
    nextMessageSenderId?: number;
    previousMessageSenderId?: number;
    clickedAnchor: (event: React.MouseEvent<HTMLDivElement>, messageId: number) => void;
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
    nextMessageSenderId,
    previousMessageSenderId,
    clickedAnchor,
}: MessageProps): React.ReactElement {
    const roomId = +useParams().id;

    const user = useSelector(selectUser);
    const { data } = useGetRoomQuery(roomId);
    const users = data?.room?.users;
    const roomType = data?.room?.type;
    const sender = users?.find((u) => u.userId === fromUserId)?.user;

    const isUsersMessage = user?.id === fromUserId;
    const isFirstMessage = fromUserId !== previousMessageSenderId;
    const isLastMessage = fromUserId !== nextMessageSenderId;

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
        <Box key={id}>
            {roomType === "group" && !isUsersMessage && isFirstMessage && (
                <Typography color="#9AA0A6" fontWeight={600} fontSize="0.75rem" pl="34px" mb="10px">
                    {sender?.displayName}
                </Typography>
            )}
            <Box
                display="flex"
                flexDirection="row"
                justifyContent={isUsersMessage ? "flex-end" : "flex-start"}
                mb={"0.375rem"}
                alignItems="end"
                onContextMenu={(e) => {
                    e.preventDefault();
                    clickedAnchor(e, id);
                }}
            >
                {roomType === "group" && !isUsersMessage && isLastMessage ? (
                    <Avatar
                        sx={{ width: 26, height: 26, mr: 1, mb: "0.375rem" }}
                        alt={sender?.displayName}
                        src={`${UPLOADS_BASE_URL}${sender?.avatarUrl}`}
                    />
                ) : (
                    <Box width="26px" mr={1}></Box>
                )}
                {type === "text" && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
                {type === "image" && <ImageMessage body={body} isUsersMessage={isUsersMessage} />}
                {type === "video" && <VideoMessage body={body} isUsersMessage={isUsersMessage} />}
                {type === "audio" && <AudioMessage body={body} isUsersMessage={isUsersMessage} />}
                {(type === "file" || type === "unknown") && (
                    <FileMessage body={body} isUsersMessage={isUsersMessage} />
                )}
                {isUsersMessage && <MessageStatusIcon status={getStatusIcon()} />}
            </Box>
        </Box>
    );
}

function ImageMessage({ body, isUsersMessage }: { body: any; isUsersMessage: boolean }) {
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
        <Box display="flex" flexDirection="column" alignItems={isUsersMessage ? "end" : "start"}>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                onClick={handleOpen}
                component="img"
                borderRadius="0.625rem"
                maxWidth="35rem"
                height="10rem"
                width="auto"
                src={`${UPLOADS_BASE_URL}${body.file.path}`}
                pb="0.8125"
                sx={{ cursor: "pointer" }}
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
                            src={`${UPLOADS_BASE_URL}${body.file.path}`}
                        />
                    </Box>
                </>
            </Modal>
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
            <Box component="audio" controls borderRadius="0.625rem" maxWidth="35rem" pb="0.8125">
                <source type={body.file.type} src={`${UPLOADS_BASE_URL}${body.file.path}`} />
            </Box>
        </Box>
    );
}

function TextMessage({ isUsersMessage, body }: { body: any; isUsersMessage: boolean }) {
    const filterText = (text: string): string => {
        // escape html
        text = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        return text;
    };

    return (
        <Box
            maxWidth="80%"
            bgcolor={isUsersMessage ? "#C8EBFE" : "#F2F2F2"}
            borderRadius="1rem"
            p="10px"
        >
            <Typography fontWeight={500} fontSize="0.9rem" color="#131940" lineHeight="1.5rem">
                <pre
                    style={{ padding: "0px", margin: "0px", whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{ __html: filterText(body.text) }}
                />
            </Typography>
        </Box>
    );
}
