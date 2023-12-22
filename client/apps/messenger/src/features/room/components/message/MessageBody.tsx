import React from "react";
import { Box, LinearProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import { useGetRoomQuery } from "../../api/room";
import AttachmentManager from "../../lib/AttachmentManager";
import { deletedMessageText } from "../../lib/consts";
import TextMessage from "./messageTypes/TextMessage";
import ImageMessage from "./messageTypes/ImageMessage";
import VideoMessage from "./messageTypes/VideoMessage";
import FileMessage from "./messageTypes/FileMessage";
import { DOWNLOAD_URL } from "../../../../../../../lib/constants";
import { setTargetMessage } from "../../slices/messages";
import { useAppDispatch } from "../../../../hooks";

type MessageBodyProps = {
    id: number;
    type: string;
    body: any;
    side: "left" | "right";
    isReply?: boolean;
    onImageMessageClick?: () => void;
    deleted: boolean;
    progress?: number;
    highlighted: boolean;
};

export default function MessageBody({
    type,
    body,
    side,
    isReply,
    onImageMessageClick,
    deleted,
    progress,
    highlighted,
    id,
}: MessageBodyProps): React.ReactElement {
    if (deleted) {
        return (
            <TextMessage
                body={{ text: deletedMessageText }}
                deleted={deleted}
                isUsersMessage={side === "right"}
                highlighted={highlighted}
                id={id}
            />
        );
    }

    if (isReply) {
        return (
            <ReplyMessage
                body={body}
                isUsersMessage={side === "right"}
                type={type}
                onImageMessageClick={onImageMessageClick}
                progress={progress}
                highlighted={highlighted}
                id={id}
            />
        );
    }

    switch (type) {
        case "text": {
            return (
                <TextMessage
                    body={body}
                    isUsersMessage={side === "right"}
                    highlighted={highlighted}
                    id={id}
                />
            );
        }

        case "image": {
            return (
                <>
                    <ImageMessage
                        body={body}
                        isUsersMessage={side === "right"}
                        onClick={onImageMessageClick}
                        progress={progress}
                        highlighted={highlighted}
                        id={id}
                    />
                </>
            );
        }

        case "video": {
            return (
                <>
                    <VideoMessage
                        onClick={onImageMessageClick}
                        body={body}
                        isUsersMessage={side === "right"}
                        progress={progress}
                        highlighted={highlighted}
                        id={id}
                    />
                </>
            );
        }

        case "audio": {
            return (
                <>
                    <AudioMessage
                        body={body}
                        isUsersMessage={side === "right"}
                        highlighted={highlighted}
                    />
                    {progress && <LinearProgress variant="determinate" value={progress} />}
                    {progress && progress === 100 && <Box>Verifying hash...</Box>}
                </>
            );
        }

        default: {
            return (
                <>
                    <FileMessage
                        body={body}
                        isUsersMessage={side === "right"}
                        progress={progress}
                        highlighted={highlighted}
                    />
                </>
            );
        }
    }
}

function AudioMessage({
    body,
    isUsersMessage,
    highlighted,
}: {
    body: any;
    isUsersMessage: boolean;
    highlighted?: boolean;
}) {
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
            {text && (
                <TextMessage
                    body={body}
                    highlighted={highlighted}
                    isUsersMessage={isUsersMessage}
                />
            )}
            <Box
                component="audio"
                controls
                bgcolor={highlighted ? "#d7aa5a" : "transparent"}
                borderRadius="0.625rem"
                maxWidth="35rem"
                p="2px"
            >
                <source type={mimeType} src={src} />
            </Box>
        </>
    );
}

function ReplyMessage({
    isUsersMessage,
    body,
    type,
    onImageMessageClick,
    progress,
    highlighted,
    id,
}: {
    body: any;
    isUsersMessage: boolean;
    type: string;
    onImageMessageClick?: () => void;
    progress?: number;
    highlighted: boolean;
    id: number;
}) {
    const roomId = parseInt(useParams().id || "");
    const { data: room } = useGetRoomQuery(roomId);
    const dispatch = useAppDispatch();

    const renderReplyMessage = () => {
        const { type: replyMsgType, body: replyMsgBody } = body.referenceMessage;
        const sender = room?.users?.find((u) => u.userId === body.referenceMessage.fromUserId)
            ?.user;

        const needsToTruncate =
            replyMsgType === "text" && (replyMsgBody.text as string).length > 120;

        switch (replyMsgType) {
            case "text": {
                return (
                    <TextMessage
                        body={{
                            ...replyMsgBody,
                            ...(needsToTruncate && {
                                text: `${replyMsgBody.text.slice(0, 120)}...`,
                            }),
                        }}
                        isUsersMessage={!isUsersMessage}
                        sender={sender}
                        isReply={true}
                        showBoxShadow={false}
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
                            <Box mb={0.75} fontWeight="600">
                                {sender.displayName}
                            </Box>
                        )}
                        <ImageMessage
                            body={replyMsgBody}
                            isUsersMessage={!isUsersMessage}
                            onClick={() => true}
                            showBoxShadow={false}
                            isReply={true}
                            id={id}
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
                        <VideoMessage
                            onClick={() => true}
                            body={replyMsgBody}
                            isUsersMessage={!isUsersMessage}
                            showBoxShadow={false}
                            isReply={true}
                            id={id}
                        />
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
                        <FileMessage
                            body={replyMsgBody}
                            isUsersMessage={!isUsersMessage}
                            showBoxShadow={false}
                        />
                    </Box>
                );
            }
        }
    };

    const renderMessage = () => {
        switch (type) {
            case "text": {
                return (
                    <TextMessage
                        highlighted={highlighted}
                        body={body}
                        isUsersMessage={isUsersMessage}
                        id={id}
                        isReply={true}
                        showBoxShadow={false}
                    />
                );
            }

            case "image": {
                return (
                    <>
                        <ImageMessage
                            body={body}
                            isUsersMessage={isUsersMessage}
                            onClick={onImageMessageClick}
                            progress={progress}
                            highlighted={highlighted}
                            id={id}
                        />
                    </>
                );
            }

            case "video": {
                return (
                    <>
                        <VideoMessage
                            onClick={onImageMessageClick}
                            body={body}
                            isUsersMessage={isUsersMessage}
                            progress={progress}
                            highlighted={highlighted}
                            id={id}
                        />
                    </>
                );
            }

            case "audio": {
                return (
                    <>
                        <AudioMessage
                            body={body}
                            isUsersMessage={isUsersMessage}
                            highlighted={highlighted}
                        />
                        {progress && <LinearProgress variant="determinate" value={progress} />}
                        {progress && progress === 100 && <Box>Verifying hash...</Box>}
                    </>
                );
            }

            default: {
                return (
                    <>
                        <FileMessage
                            body={body}
                            isUsersMessage={isUsersMessage}
                            progress={progress}
                            highlighted={highlighted}
                        />
                    </>
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
                maxWidth: "50rem",
                backgroundColor: highlighted
                    ? "#d7aa5a"
                    : isUsersMessage
                    ? "common.myMessageBackground"
                    : "background.paper",
                borderRadius: "10px",
                boxShadow: "0 2px 5px 0 rgba(0, 0, 0, 0.10)",
                padding: "0.4rem 0.4rem 0 0.4rem",
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

            {renderMessage()}
        </Box>
    );
}
