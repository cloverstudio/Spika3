import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useParams } from "react-router-dom";
import AttachmentManager from "../lib/AttachmentManager";
import SendIcon from "@mui/icons-material/SendRounded";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import { keyframes } from "@mui/system";
import { useTheme } from "@mui/material/styles";

import {
    selectEditMessage,
    selectReplyMessage,
    selectInputText,
    setEditMessage,
    setInputText,
    selectInputType,
    setInputType,
    addEmoji,
    setReplyMessage,
    fetchThumbnailData,
    removeThumbnailData,
    setIsThumbnailDataLoading,
    setIsThumbnailDataFetchingAborted,
    setThumbnailUrl,
    setMessageCursorPosition,
} from "../slices/input";
import AddAttachment from "./AddAttachment";
import Attachments from "./Attachments";
import EmojiPicker from "./emojiPicker";
import Close from "@mui/icons-material/Close";
import { useGetRoomQuery, useGetRoomBlockedQuery } from "../api/room";
import MessageType from "../../../types/Message";
import getFileIcon from "../lib/getFileIcon";
import { editMessageThunk, replyMessageThunk, sendMessage } from "../slices/messages";
import useStrings from "../../../hooks/useStrings";
import { useRemoveBlockByIdMutation } from "../api/user";
import DoDisturb from "@mui/icons-material/DoDisturb";
import useAutoSizeTextArea from "../hooks/useAutoSizeTextArea";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import linkifyHtml from "linkify-html";
import useEscapeKey from "../../../hooks/useEscapeKey";

export default function ChatInputContainer(): React.ReactElement {
    const dispatch = useAppDispatch();
    const roomId = parseInt(useParams().id || "");
    const inputType = useSelector(selectInputType(roomId));
    const { data: roomBlock } = useGetRoomBlockedQuery(roomId);
    const [removeBlock] = useRemoveBlockByIdMutation();
    const strings = useStrings();

    const [files, setFiles] = useState(AttachmentManager.getFiles(roomId) || []);
    const canvasRef = useRef<HTMLCanvasElement>();

    const inputTypeIsFiles = inputType === "files";

    useEffect(() => {
        if (files.length > 0) {
            dispatch(setInputType({ roomId, type: "files" }));
        } else {
            dispatch(setInputType({ roomId, type: "text" }));
        }
    }, [files.length, dispatch, roomId]);

    const handleSend = async () => {
        if (inputTypeIsFiles) {
            AttachmentManager.send({ roomId });
        } else {
            dispatch(
                sendMessage({
                    roomId,
                    type: "text",
                    body: {},
                }),
            );
        }
    };

    useEffect(() => {
        AttachmentManager.addEventListener(roomId, (files) => setFiles(files));

        return () => AttachmentManager.removeEventListener(roomId);
    }, [roomId]);

    const handleSetMessageText = (message: string) => {
        dispatch(setInputText({ text: message, roomId }));
    };

    if (roomBlock) {
        return (
            <Box borderTop="1px solid #C9C9CA" px={2} py={2} bgcolor="common.chatBackground">
                <Box display="flex" flexDirection="column" justifyContent="center">
                    <Stack
                        spacing={2}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                    >
                        <DoDisturb />

                        <Typography>
                            {strings.youBlockedThisContact}{" "}
                            <Box
                                component="span"
                                sx={{ textDecoration: "underline", cursor: "pointer" }}
                                onClick={() => removeBlock(roomBlock.id)}
                            >
                                {strings.clickHereToUnblock}
                            </Box>
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        );
    }

    return (
        <Box borderTop="1px solid" sx={{ borderColor: "divider" }}>
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <Stack direction="row" alignItems="center" width="100%" overflow="hidden" py={1}>
                <ChatInput
                    handleSetMessageText={handleSetMessageText}
                    handleSend={handleSend}
                    files={files}
                />
            </Stack>
        </Box>
    );
}

type ChatInputProps = {
    handleSetMessageText: (string) => void;
    handleSend: () => void;
    files: File[];
};

function ChatInput({ handleSend, files }: ChatInputProps) {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useAppDispatch();
    const editMessage = useSelector(selectEditMessage(roomId));
    const replyMessage = useSelector(selectReplyMessage(roomId));
    const inputType = useSelector(selectInputType(roomId));
    const isThumbnailDataLoading = useAppSelector(
        (state) => state.input.list[roomId]?.isThumbnailDataLoading,
    );
    const thumbnailData = useAppSelector((state) => state.input.list[roomId]?.thumbnailData);

    const [hideTextInput, setHideTextInput] = useState(false);

    const closeEmojiPicker = () => {
        dispatch(setInputType({ roomId, type: "text" }));
    };

    useEscapeKey(closeEmojiPicker);

    const onSend = async () => {
        if (!editMessage && !replyMessage) {
            return handleSend();
        }

        if (replyMessage) {
            return dispatch(replyMessageThunk({ type: "text", roomId }));
        }

        dispatch(editMessageThunk(roomId));
    };

    if (inputType === "files") {
        return (
            <>
                <Attachments files={files} />
                <Box minWidth="70px" display="flex" justifyContent="center">
                    <SendButton onClick={handleSend} />
                </Box>
            </>
        );
    }

    return (
        <>
            <Box width="100%" position="relative">
                {inputType === "emoji" && (
                    <EmojiPicker
                        onSelect={(emoji) => dispatch(addEmoji({ roomId, emoji }))}
                        setHideTextInput={setHideTextInput}
                    />
                )}

                {replyMessage && <ReplyMessage message={replyMessage} />}
                {!isThumbnailDataLoading && thumbnailData?.title && <MessageURLThumbnail />}
                {isThumbnailDataLoading && <MessageURLThumbnailLoading />}

                {!hideTextInput && <TextInput onSend={onSend} />}
            </Box>
        </>
    );
}

function SendButton({ onClick }: { onClick: () => void }): React.ReactElement {
    return (
        <Box
            id="send-button"
            width={35}
            height={35}
            onClick={onClick}
            sx={{ cursor: "pointer" }}
            bgcolor="primary.main"
            borderRadius="50%"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <SendIcon
                color="inherit"
                sx={{
                    position: "relative",
                    left: "2px",
                }}
            />
        </Box>
    );
}

function TextInput({ onSend }: { onSend: () => void }): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const editMessage = useSelector(selectEditMessage(roomId));

    const strings = useStrings();
    const message = useSelector(selectInputText(roomId));
    const dispatch = useAppDispatch();
    const inputType = useSelector(selectInputType(roomId));

    const url = useAppSelector((state) => state.input.list[roomId]?.thumbnailUrl);

    const handleSetMessageText = (text: string) => dispatch(setInputText({ text, roomId }));

    function isValidURL(url: string) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    useEffect(() => {
        if (!message) dispatch(removeThumbnailData({ roomId }));

        const urlInMessage = linkifyHtml(message)
            ?.split("<a href=")[1]
            ?.split(">")[0]
            ?.replace(/"/g, "");

        if (urlInMessage === url) return;

        if (urlInMessage && isValidURL(urlInMessage)) {
            dispatch(setThumbnailUrl({ roomId, url: urlInMessage }));
            dispatch(setIsThumbnailDataLoading({ roomId, isLoading: true }));
        } else {
            dispatch(setThumbnailUrl({ roomId, url: "" }));
            dispatch(setIsThumbnailDataLoading({ roomId, isLoading: false }));
        }
    }, [message, dispatch]);

    useEffect(() => {
        if (!url) {
            dispatch(removeThumbnailData({ roomId }));
            return;
        }

        let timer: NodeJS.Timeout;

        timer = setTimeout(() => {
            dispatch(fetchThumbnailData({ url: url, roomId }));
        }, 600);

        return () => clearTimeout(timer);
    }, [url, dispatch]);

    const handleCloseEdit = () => {
        dispatch(setEditMessage({ message: null, roomId }));
        handleSetMessageText("");
    };

    if (editMessage) {
        return (
            <Box
                display="flex"
                gap={1}
                justifyContent="center"
                alignItems="center"
                flexWrap="wrap"
                mr={2}
                ml={2}
            >
                <Box
                    sx={{
                        color: "text.primary",
                        backgroundColor: "background.paper",
                        borderRadius: "10px",
                        position: "relative",
                        flexGrow: 1,
                    }}
                >
                    <TextArea onSend={onSend} />
                    <ReactionIcon />
                </Box>

                <Box display="flex" gap={0.5}>
                    <Button size="small" onClick={handleCloseEdit} variant="text">
                        {strings.cancel}
                    </Button>
                    <Button size="small" onClick={onSend} variant="contained">
                        {strings.save}
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <AddAttachment />
            <Box
                sx={{
                    color: "text.primary",
                    backgroundColor: "background.paper",
                    borderRadius: "10px",
                    ml: message || inputType === "emoji" ? 2 : 0,
                    position: "relative",
                    flexGrow: 1,
                }}
            >
                <TextArea onSend={onSend} />
                <ReactionIcon />
            </Box>
            <Box minWidth="70px" display="flex" justifyContent="center">
                <SendButton onClick={onSend} />
            </Box>
        </Box>
    );
}

function TextArea({ onSend }: { onSend: () => void }): React.ReactElement {
    const roomId = parseInt(useParams().id || "");

    const strings = useStrings();
    const message = useSelector(selectInputText(roomId));
    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLTextAreaElement>();

    const cursorPosition = useAppSelector(
        (state) => state.input.list[roomId]?.messageCursorPosition,
    );

    const isInputFocused = inputRef.current === document.activeElement;

    const getCursorPosition = () => {
        if (inputRef.current) {
            const startPosition = inputRef.current.selectionStart;
            dispatch(setMessageCursorPosition({ roomId, position: startPosition }));
        }
    };

    useAutoSizeTextArea(inputRef, message);

    useEffect(() => {
        if (!isInputFocused) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [message]);

    const handleSetMessageText = (text: string) => dispatch(setInputText({ text, roomId }));

    return (
        <textarea
            autoFocus={true}
            ref={inputRef}
            value={message}
            id="chat-input"
            onPaste={(e) => {
                const items = e.clipboardData?.items;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") !== -1) {
                            const blob = items[i].getAsFile();
                            AttachmentManager.addFiles({ roomId, files: [blob] });
                            e.preventDefault();
                        }
                    }
                }
            }}
            onChange={({ target }) => {
                handleSetMessageText(target.value);
                getCursorPosition();
            }}
            onClick={getCursorPosition}
            onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey === true) {
                    handleSetMessageText(e.currentTarget.value);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    onSend();
                } else {
                }
            }}
            onKeyUp={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    getCursorPosition();
                }
            }}
            placeholder={strings.typeHere}
            rows={1}
            style={{
                color: "inherit",
                backgroundColor: "transparent",
                fontSize: "16px",
                padding: "12px 16px 12px 16px",
                fontWeight: "500",
                border: "none",
                display: "block",
                width: "100%",
                outline: "none",
                paddingRight: "46px",
                resize: "none",
                borderRadius: "10px",
                fontFamily: "inherit",
            }}
        />
    );
}

function ReactionIcon(): React.ReactElement {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useAppDispatch();
    const inputType = useSelector(selectInputType(roomId));

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                right: "40px",
                transform: "translate(100%, -50%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
            }}
        >
            <EmojiEmotionsIcon
                color="primary"
                onClick={() =>
                    dispatch(
                        setInputType(
                            inputType === "emoji"
                                ? { roomId, type: "text" }
                                : { roomId, type: "emoji" },
                        ),
                    )
                }
                sx={{
                    cursor: "pointer",
                }}
            />
        </Box>
    );
}

function ReplyMessage({ message }: { message: MessageType }): React.ReactElement {
    const dispatch = useAppDispatch();
    const roomId = parseInt(useParams().id || "");

    const { data: room } = useGetRoomQuery(roomId);

    const sender = room.users?.find((u) => u.userId === message.fromUserId)?.user;
    const Icon = getFileIcon(message.body?.file?.mimeType);

    const needsToTruncate = message.type === "text" && (message.body.text as string).length > 120;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") dispatch(setReplyMessage({ message: null, roomId }));
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    });

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                ml: "16px",
                mb: "12px",
            }}
        >
            <Box
                width="100%"
                position="relative"
                sx={{
                    backgroundColor: "background.paper",
                    borderRadius: "10px",
                    padding: "0.4rem",
                    color: "common.darkBlue",
                    wordBreak: "break-word",
                }}
            >
                {sender && (
                    <Box mb={0.75} fontWeight="medium">
                        {sender.displayName}
                    </Box>
                )}

                {message.body?.text && needsToTruncate
                    ? `${message.body.text.slice(0, 120)}...`
                    : message.body?.text}
                {message.type === "image" && (
                    <Box
                        component="img"
                        borderRadius="0.3rem"
                        maxWidth="10rem"
                        height="3rem"
                        width="auto"
                        src={`${API_BASE_URL}/upload/files/${message.body.thumbId}`}
                        sx={{ cursor: "pointer", objectFit: "contain" }}
                    />
                )}
                {message.type === "audio" && (
                    <Box component="audio" controls borderRadius="0.3rem" maxWidth="10rem">
                        <source
                            type={message.body.file.type}
                            src={`${API_BASE_URL}/upload/files/${message.body.fileId}`}
                        />
                    </Box>
                )}
                {message.type === "video" && (
                    <Box
                        component="video"
                        borderRadius="0.3rem"
                        maxWidth="10rem"
                        controls
                        src={`${API_BASE_URL}/upload/files/${message.body.fileId}`}
                    />
                )}
                {message.type === "file" && <Icon fontSize="large" />}
            </Box>
            <IconButton
                onClick={() => dispatch(setReplyMessage({ message: null, roomId }))}
                sx={{ width: "35px", height: "35px", margin: "0 18px" }}
            >
                <Close fontSize="inherit" />
            </IconButton>
        </Box>
    );
}

export function MessageURLThumbnail() {
    const roomId = parseInt(useParams().id || "");

    const messageInput = useSelector(selectInputText(roomId));

    const dispatch = useAppDispatch();

    const thumbnailData = useAppSelector((state) => state.input.list[roomId]?.thumbnailData);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (thumbnailData && !messageInput) {
            dispatch(removeThumbnailData({ roomId }));
        }
    }, [thumbnailData]);

    return (
        <Box
            sx={{
                pl: 2,
                width: "100%",
                height: "72x",

                borderBottom: "0.5px solid",
                borderColor: "divider",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    height: "56px",
                    alignItems: "center",
                    width: "100%",
                    gap: "10px",
                    bgcolor: "background.paper",
                    marginBottom: "8px",
                    overflow: "hidden",
                    borderRadius: "10px",
                    "&:hover": {
                        cursor: "pointer",
                    },
                }}
                onClick={() => {
                    window.open(thumbnailData?.url, "_blank");
                }}
            >
                {(thumbnailData?.image || thumbnailData?.icon) && !imageError && (
                    <img
                        style={{
                            width: "auto",
                            height: "100%",
                            objectFit: "fill",
                            borderRadius: "10px 0 0 10px",
                        }}
                        alt="image"
                        src={thumbnailData?.image || thumbnailData?.icon}
                        onError={() => setImageError(true)}
                    />
                )}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        marginLeft:
                            imageError || (!thumbnailData.image && !thumbnailData.icon)
                                ? "10px"
                                : 0,
                    }}
                >
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, lineHeight: "16px" }}>
                        {thumbnailData.title}
                    </Typography>
                    <Typography
                        fontWeight={400}
                        fontSize="11px"
                        fontFamily="inherit"
                        maxWidth="150ch"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                    >
                        {thumbnailData?.description}
                    </Typography>
                </Box>
            </Box>
            <IconButton
                onClick={() => dispatch(removeThumbnailData({ roomId }))}
                sx={{ width: "35px", height: "35px", margin: "0 18px" }}
            >
                <Close fontSize="inherit" color="primary" />
            </IconButton>
        </Box>
    );
}

export function MessageURLThumbnailLoading() {
    const roomId = parseInt(useParams().id || "");
    const thumbnailUrl = useAppSelector((state) => state.input.list[roomId]?.thumbnailUrl);

    const dispatch = useAppDispatch();

    const theme = useTheme();

    const isDarkMode = theme.palette.mode === "dark";

    const spin = keyframes`
    from {
      transform: translateX(-100%);
    }
    to {
        transform: translateX(200%);
    }
  `;

    return (
        <Box
            sx={{
                pl: 2,
                width: "100%",
                height: "72x",
                borderBottom: "0.5px solid",
                borderColor: "divider",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "56px",
                    width: "100%",
                    gap: "10px",
                    bgcolor: "background.paper",
                    marginBottom: "8px",
                    overflow: "hidden",
                    borderRadius: "10px",
                    position: "relative",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        background: `linear-gradient(to right, transparent, ${
                            isDarkMode ? "#444444" : "#E6E6E6"
                        }, transparent)`,
                        width: "100%",
                        height: "100%",
                        opacity: 0.7,
                        animation: `${spin} 0.9s infinite linear`,
                    }}
                />
                <LinkIcon sx={{ color: "text.tertiary", marginLeft: "12px", fontSize: "32px" }} />
                <Typography sx={{ fontWeight: 500, fontSize: "14px", color: "primary" }}>
                    {thumbnailUrl}
                </Typography>
            </Box>
            <IconButton
                onClick={() => {
                    dispatch(setIsThumbnailDataFetchingAborted({ roomId, isAborted: true }));
                    dispatch(setIsThumbnailDataLoading({ roomId, isLoading: false }));
                    dispatch(removeThumbnailData({ roomId }));
                }}
                sx={{ width: "35px", height: "35px", margin: "0 18px" }}
            >
                <Close fontSize="inherit" color="primary" />
            </IconButton>
        </Box>
    );
}
