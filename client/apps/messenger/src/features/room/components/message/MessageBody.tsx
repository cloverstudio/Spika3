import React, { useState } from "react";
import { Box } from "@mui/material";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import getFileIcon from "../../lib/getFileIcon";
import DownloadIcon from "@mui/icons-material/Download";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { useParams } from "react-router-dom";
import UserType from "../../../../types/User";
import { useGetRoomQuery } from "../../api/room";
import AttachmentManager from "../../lib/AttachmentManager";
import { useDispatch } from "react-redux";
import { setTargetMessage } from "../../slices/messages";

type MessageBodyProps = {
    id: number;
    type: string;
    body: any;
    side: "left" | "right";
    isReply?: boolean;
    onImageMessageClick?: () => void;
    deleted: boolean;
};

declare const API_BASE_URL: string;
const DOWNLOAD_URL = `${API_BASE_URL}/upload/files`;

export default function MessageBody({
    type,
    body,
    side,
    isReply,
    onImageMessageClick,
    deleted,
}: MessageBodyProps): React.ReactElement {
    if (deleted) {
        return <TextMessage body={body} deleted={deleted} isUsersMessage={side === "right"} />;
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
    const roomId = parseInt(useParams().id || "");
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
        onClick();
    };
    const handleClose = () => setOpen(false);

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    const { file: fileFromServer, uploadingFileName, thumbId, fileId, text } = body;

    const localFile =
        uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });
    const file = localFile || fileFromServer;

    if (!file) {
        return null;
    }
    const thumbSrc = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${thumbId}`;
    const imgSrc = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${fileId}`;

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
            {text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                onClick={handleOpen}
                component="img"
                borderRadius="0.625rem"
                maxWidth="256px"
                height="10vh"
                src={thumbSrc}
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
                            src={imgSrc}
                        />
                    </Box>
                </>
            </Modal>
        </>
    );
}

function FileMessage({ body, isUsersMessage }: { body: any; isUsersMessage: boolean }) {
    const roomId = parseInt(useParams().id || "");

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    const { file: fileFromServer, uploadingFileName, text } = body;
    const localFile =
        uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });
    const file = localFile || fileFromServer;

    const href = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${body.fileId}`;
    const mimeType = localFile ? file.type : file.mimeType;
    const name = localFile ? file.name : file.fileName;

    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    const sizeInKB = (file.size / 1024).toFixed(2);

    const Icon = getFileIcon(mimeType);
    return (
        <>
            {text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                display="flex"
                alignItems="center"
                borderRadius="0.625rem"
                maxWidth="35rem"
                p="1.25rem"
                gap="1.25rem"
                bgcolor={isUsersMessage ? "common.myMessageBackground" : "background.paper"}
            >
                <Icon fontSize="large" />
                <Box>
                    <Typography fontSize="1rem" fontWeight={800} lineHeight="1.1rem" mb={0.25}>
                        {name}
                    </Typography>
                    <Typography textAlign="left">
                        {+sizeInMB > 0 ? `${sizeInMB} MB` : `${sizeInKB} KB`}
                    </Typography>
                </Box>
                <Box
                    component="a"
                    href={href}
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
    const roomId = parseInt(useParams().id || "");

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    const { file: fileFromServer, text, uploadingFileName } = body;
    const localFile =
        uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });
    const file = localFile || fileFromServer;

    const src = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${body.fileId}`;
    const mimeType = localFile ? file.type : file.mimeType;

    return (
        <>
            {text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box component="video" borderRadius="0.625rem" height="43vh" controls pb="0.8125">
                <source type={mimeType} src={src} />
                Your browser does not support the video tag.
            </Box>
        </>
    );
}

function AudioMessage({ body, isUsersMessage }: { body: any; isUsersMessage: boolean }) {
    const roomId = parseInt(useParams().id || "");

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    const { file: fileFromServer, text, uploadingFileName } = body;
    const localFile =
        uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });
    const file = localFile || fileFromServer;

    const src = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${body.fileId}`;
    const mimeType = localFile ? file.type : file.mimeType;

    return (
        <>
            {text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                component="audio"
                controls
                borderRadius="0.625rem"
                maxWidth="35rem"
                height="5vh"
                pb="0.8125"
            >
                <source type={mimeType} src={src} />
            </Box>
        </>
    );
}

function ReplyMessage({ isUsersMessage, body }: { body: any; isUsersMessage: boolean }) {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useDispatch();
    const { data: room } = useGetRoomQuery(roomId);

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
                                : "background.paper",
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
                                : "background.paper",
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
                                : "background.paper",
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
                                : "background.paper",
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
        dispatch(setTargetMessage({ roomId, messageId: body.referenceMessage.id }));
    };

    return (
        <Box
            component={"div"}
            sx={{
                minWidth: "50px",
                maxWidth: "50rem",
                backgroundColor: isUsersMessage ? "common.myMessageBackground" : "background.paper",
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

            <Box
                sx={{ overflowWrap: "break-word" }}
                dangerouslySetInnerHTML={{ __html: filterText(body.text) }}
            />
        </Box>
    );
}

function TextMessage({
    isUsersMessage,
    body,
    sender,
    deleted,
}: {
    body: any;
    isUsersMessage: boolean;
    sender?: UserType;
    deleted?: boolean;
}) {
    const backgroundColor = deleted
        ? "background.transparent"
        : isUsersMessage
        ? "common.myMessageBackground"
        : "background.paper";
    return (
        <Box
            component={"div"}
            sx={{
                minWidth: "50px",
                maxWidth: "100%",
                backgroundColor: backgroundColor,
                borderRadius: "0.3rem",
                padding: "0.4rem",
                cursor: "pointer",
                color: deleted ? "text.tertiary" : "common.darkBlue",
                lineHeight: "1.2rem",
                whiteSpace: "pre-wrap",
                margin: "0px",
                fontSize: "0.95rem",
                border: deleted ? "1px solid #C9C9CA" : "none",
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

function filterText(text: string): string {
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
    const autolinkRegex = /(?![^<]*>|[^<>]*<\/)((https?:)\/\/[a-z0-9&#%;:~=.\/\-?_+]+)/gi;
    const internalLink = text.includes(window.origin);

    text = text.replace(
        autolinkRegex,
        `<a href="$1" ${!internalLink ? 'target="_blank"' : ""} >$1</a>`
    );

    return text;
}
