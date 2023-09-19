import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useParams } from "react-router-dom";
import AttachmentManager from "../lib/AttachmentManager";
import SendIcon from "@mui/icons-material/SendRounded";
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
import { string } from "yup";

export default function ChatInputContainer(): React.ReactElement {
    const dispatch = useDispatch();
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
                })
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
                <AddAttachment />

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

function ChatInput({ handleSetMessageText, handleSend, files }: ChatInputProps) {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useDispatch();
    const editMessage = useSelector(selectEditMessage(roomId));
    const replyMessage = useSelector(selectReplyMessage(roomId));
    const inputType = useSelector(selectInputType(roomId));
    const strings = useStrings();

    const onSend = async () => {
        if (!editMessage && !replyMessage) {
            return handleSend();
        }

        if (replyMessage) {
            return dispatch(replyMessageThunk({ type: "text", roomId }));
        }

        dispatch(editMessageThunk(roomId));
    };

    const handleCloseEdit = () => {
        dispatch(setEditMessage({ message: null, roomId }));
        handleSetMessageText("");
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
                    <EmojiPicker onSelect={(emoji) => dispatch(addEmoji({ roomId, emoji }))} />
                )}

                {replyMessage && <ReplyMessage message={replyMessage} />}
                <Box width="100%" position="relative">
                    <TextInput onSend={onSend} />
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
                                            : { roomId, type: "emoji" }
                                    )
                                )
                            }
                            sx={{
                                cursor: "pointer",
                            }}
                        />
                    </Box>
                </Box>
            </Box>
            {editMessage ? (
                <Box display="flex" mx={1}>
                    <Button
                        size="small"
                        onClick={handleCloseEdit}
                        variant="outlined"
                        sx={{ mr: 1 }}
                    >
                        {strings.cancel}
                    </Button>
                    <Button size="small" onClick={onSend} variant="contained">
                        {strings.save}
                    </Button>
                </Box>
            ) : (
                <Box minWidth="70px" display="flex" justifyContent="center">
                    <SendButton onClick={onSend} />
                </Box>
            )}
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

const useStyles = makeStyles(() => ({
    input: {
        border: "none",
        padding: "10px",
        display: "block",
        width: "100%",
        outline: "none",
        fontSize: "0.9em",
        paddingRight: "46px",
        resize: "none",
        borderRadius: "10px",
        fontFamily: "inherit",
    },
}));

function TextInput({ onSend }: { onSend: () => void }): React.ReactElement {
    const strings = useStrings();
    const style = useStyles();
    const roomId = parseInt(useParams().id || "");
    const message = useSelector(selectInputText(roomId));
    const inputRef = useRef<HTMLTextAreaElement>();
    const dispatch = useDispatch();
    const inputType = useSelector(selectInputType(roomId));

    useAutoSizeTextArea(inputRef.current, message);

    const handleSetMessageText = (text: string) => dispatch(setInputText({ text, roomId }));

    useEffect(() => {
        inputRef.current.focus();
    });

    return (
        <Box
            sx={{
                color: "text.primary",
                backgroundColor: "background.paper",
                borderRadius: "10px",
                ml: message || inputType === "emoji" ? 2 : 0,
            }}
        >
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
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && e.shiftKey === true) {
                        handleSetMessageText(e.currentTarget.value);
                    } else if (e.key === "Enter") {
                        e.preventDefault();
                        onSend();
                    } else {
                    }
                }}
                placeholder={strings.typeHere}
                className={style.input}
                rows={1}
                style={{
                    color: "inherit",
                    backgroundColor: "transparent",
                    fontSize: "16px",
                    padding: "12px 16px 12px 16px",
                    fontWeight: "500",
                }}
            />
        </Box>
    );
}

function ReplyMessage({ message }: { message: MessageType }): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = parseInt(useParams().id || "");

    const { data: room } = useGetRoomQuery(roomId);

    const sender = room.users?.find((u) => u.userId === message.fromUserId)?.user;
    const Icon = getFileIcon(message.body?.file?.mimeType);
    const inputText = useSelector(selectInputText(roomId));

    return (
        <Box
            width="auto"
            position="relative"
            sx={{
                backgroundColor: "background.paper",
                borderRadius: "0.3rem",
                padding: "0.4rem",
                color: "common.darkBlue",
                wordBreak: "break-word",
            }}
            mb={1}
            ml={inputText.length > 0 ? 2 : 0}
        >
            {sender && (
                <Box mb={0.75} fontWeight="medium">
                    {sender.displayName}
                </Box>
            )}

            {message.body?.text && message.body?.text}
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
            <IconButton
                size="small"
                onClick={() => dispatch(setReplyMessage({ message: null, roomId }))}
                sx={{ position: "absolute", right: "4px", top: "4px" }}
            >
                <Close fontSize="inherit" />
            </IconButton>
        </Box>
    );
}
