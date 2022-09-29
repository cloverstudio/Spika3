import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, CircularProgress, IconButton, LinearProgress, Stack } from "@mui/material";
import { makeStyles } from "@mui/styles";

import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useParams } from "react-router-dom";
import AttachmentManager from "../lib/AttachmentManager";
import uploadFile from "../../../utils/uploadFile";
import SendIcon from "@mui/icons-material/Send";
import { useShowBasicDialog } from "../../../hooks/useModal";
import {
    sendMessage,
    selectEditMessage,
    selectReplyMessage,
    selectMessageText,
    setEditMessage,
    setMessageText,
    selectInputType,
    setInputType,
    editMessageThunk,
    addEmoji,
    selectSendingMessage,
    selectInputTypeIsFiles,
    replyMessageThunk,
    setReplyMessage,
    selectActiveRoomId,
} from "../slice/chatSlice";
import getFileType from "../lib/getFileType";
import AddAttachment from "./AddAttachment";
import generateThumbFile from "../lib/generateThumbFile";
import Attachments from "./Attachments";
import EmojiPicker from "./emojiPicker";
import Close from "@mui/icons-material/Close";
import { useGetRoomQuery } from "../api/room";
import MessageType from "../../../types/Message";
import getFileIcon from "../lib/getFileIcon";

export default function ChatInputContainer(): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = parseInt(useParams().id || "");
    const inputTypeIsFiles = useSelector(selectInputTypeIsFiles);
    const [loading, setLoading] = useState(false);

    const [filesSent, setFilesSent] = useState(0);
    const [files, setFiles] = useState(AttachmentManager.getFiles(roomId) || []);
    const [failedToUploadFiles, setFailedToUploadFiles] = useState<File[]>([]);

    const showBasicDialog = useShowBasicDialog();
    const canvasRef = useRef<HTMLCanvasElement>();

    useEffect(() => {
        if (files.length > 0) {
            dispatch(setInputType("files"));
        } else {
            dispatch(setInputType("text"));
        }
    }, [files.length]);

    const handleSend = async () => {
        const failed: File[] = [];

        if (inputTypeIsFiles) {
            setLoading(true);
            for (const file of files) {
                try {
                    const uploaded = await uploadFile({
                        file,
                        type: file.type || "unknown",
                    });
                    let thumbFileUploaded:
                        | {
                              path: string;
                              id: number;
                          }
                        | undefined;

                    const fileType = getFileType(file.type);

                    if (fileType === "image" && canvasRef.current) {
                        const thumbFile = await generateThumbFile(file, canvasRef.current);
                        if (thumbFile) {
                            thumbFileUploaded = await uploadFile({
                                file: thumbFile,
                                type: thumbFile.type || "unknown",
                            });
                        }
                    }

                    const sent = await dispatch(
                        sendMessage({
                            roomId,
                            type: fileType,
                            body: {
                                fileId: uploaded.id,
                                thumbId: thumbFileUploaded ? thumbFileUploaded.id : uploaded.id,
                            },
                        })
                    );

                    if ((sent as { error?: any })?.error) {
                        throw Error("Send message error");
                    }

                    setFilesSent((filesSent) => filesSent + 1);
                } catch (error) {
                    showBasicDialog({ text: "Some files are not sent!", title: "Upload error" });
                    failed.push(file);
                    console.error({ failed: file, error });
                }
            }

            AttachmentManager.setFiles({ roomId, files: failed });
            setFailedToUploadFiles(failed);
            setLoading(false);
            setFilesSent(0);
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
        dispatch(setMessageText(message));
    };

    return (
        <Box borderTop="1px solid #C9C9CA" px={2} py={1}>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {loading && (
                <LinearProgress
                    sx={{ mb: 1 }}
                    variant="determinate"
                    value={(filesSent / files.length) * 100}
                />
            )}
            <Box display="flex" flexDirection="column" justifyContent="center">
                <Stack spacing={2} direction="row" alignItems="center" width="100%">
                    <AddAttachment />

                    <ChatInput
                        loading={loading}
                        handleSetMessageText={handleSetMessageText}
                        handleSend={handleSend}
                        files={files}
                        failedToUploadFiles={failedToUploadFiles}
                    />
                </Stack>
            </Box>
        </Box>
    );
}

type ChatInputProps = {
    loading: boolean;
    handleSetMessageText: (string) => void;
    handleSend: () => void;
    files: File[];
    failedToUploadFiles: File[];
};

function ChatInput({
    loading,
    handleSetMessageText,
    handleSend,
    files,
    failedToUploadFiles,
}: ChatInputProps) {
    const dispatch = useDispatch();
    const editMessage = useSelector(selectEditMessage);
    const replyMessage = useSelector(selectReplyMessage);
    const inputType = useSelector(selectInputType);

    const onSend = async () => {
        if (!editMessage && !replyMessage) {
            return handleSend();
        }

        if (replyMessage) {
            return dispatch(replyMessageThunk("text"));
        }

        dispatch(editMessageThunk());
    };

    const handleCloseEdit = () => {
        dispatch(setEditMessage(null));
        handleSetMessageText("");
    };

    if (inputType === "files") {
        return (
            <>
                <Attachments
                    files={files}
                    failedToUploadFileNames={failedToUploadFiles.map((f) => f.name)}
                />

                {loading ? (
                    <Box>
                        <CircularProgress sx={{ ml: 0 }} />
                    </Box>
                ) : (
                    <SendIcon
                        onClick={() => handleSend()}
                        fontSize="large"
                        color="primary"
                        sx={{ cursor: "pointer" }}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <Box width="100%" position="relative">
                {inputType === "emoji" && (
                    <EmojiPicker onSelect={(emoji) => dispatch(addEmoji(emoji))} />
                )}

                {replyMessage && <ReplyMessage message={replyMessage} />}
                <Box width="100%" position="relative">
                    <TextInput onSend={onSend} />
                    <EmojiEmotionsIcon
                        color="primary"
                        onClick={() =>
                            dispatch(setInputType(inputType === "emoji" ? "text" : "emoji"))
                        }
                        sx={{ position: "absolute", top: "11px", right: "20px", cursor: "pointer" }}
                    />
                </Box>
            </Box>
            {editMessage ? (
                <Box display="flex">
                    <Button onClick={handleCloseEdit} variant="outlined" sx={{ mr: 1 }}>
                        Cancel
                    </Button>
                    <Button onClick={onSend} variant="contained">
                        Save
                    </Button>
                </Box>
            ) : (
                <RightActionTextIcon onSend={onSend} />
            )}
        </>
    );
}

function RightActionTextIcon({ onSend }: { onSend: () => void }): React.ReactElement {
    const message = useSelector(selectMessageText);

    if (message.length) {
        return <SendIcon onClick={() => onSend()} color="primary" sx={{ cursor: "pointer" }} />;
    }

    return <KeyboardVoiceIcon fontSize="large" color="primary" />;
}

const useStyles = makeStyles(() => ({
    input: {
        border: "none",
        padding: "10px",
        display: "block",
        width: "100%",
        outline: "none",
        fontSize: "0.9em",
        paddingRight: "32px",
        resize: "vertical",
    },
}));

function TextInput({ onSend }: { onSend: () => void }): React.ReactElement {
    const style = useStyles();
    const message = useSelector(selectMessageText);
    const loading = useSelector(selectSendingMessage);
    const inputRef = useRef<HTMLTextAreaElement>();
    const dispatch = useDispatch();

    const handleSetMessageText = (text: string) => dispatch(setMessageText(text));

    useEffect(() => {
        inputRef.current.focus();
    });

    return (
        <textarea
            autoFocus={true}
            ref={inputRef}
            value={message}
            disabled={loading}
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
            placeholder="Type here..."
            className={style.input}
            rows={1}
        />
    );
}

function ReplyMessage({ message }: { message: MessageType }): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = useSelector(selectActiveRoomId);
    const { data } = useGetRoomQuery(roomId);

    const sender = data.room.users?.find((u) => u.userId === message.fromUserId)?.user;
    const Icon = getFileIcon(message.body.file.mimeType);

    return (
        <Box
            width="100%"
            position="relative"
            sx={{
                backgroundColor: "common.chatBackground",
                borderRadius: "0.3rem",
                padding: "0.4rem",
                color: "common.darkBlue",
            }}
            mb={1}
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
                onClick={() => dispatch(setReplyMessage(null))}
                sx={{ position: "absolute", right: "4px", top: "4px" }}
            >
                <Close fontSize="inherit" />
            </IconButton>
        </Box>
    );
}
