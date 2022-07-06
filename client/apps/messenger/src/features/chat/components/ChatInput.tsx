import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, CircularProgress, Input, LinearProgress, Stack } from "@mui/material";

import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useEditMessageMutation, useSendMessageMutation } from "../api/message";
import { useParams } from "react-router-dom";
import AttachmentManager from "../lib/AttachmentManager";
import uploadFile from "../../../utils/uploadFile";
import SendIcon from "@mui/icons-material/Send";
import { useShowBasicDialog } from "../../../hooks/useModal";
import {
    addMessage,
    selectEditMessage,
    selectMessageText,
    setEditMessage,
    setMessageText,
} from "../slice/chatSlice";
import { fetchHistory } from "../slice/roomSlice";
import getFileType from "../lib/getFileType";
import AddAttachment from "./AddAttachment";
import generateThumbFile from "../lib/generateThumbFile";
import Attachments from "./Attachments";

export default function ChatInputContainer(): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = parseInt(useParams().id || "");
    const [sendMessage] = useSendMessageMutation();
    const message = useSelector(selectMessageText);
    const [loading, setLoading] = useState(false);
    const [filesSent, setFilesSent] = useState(0);
    const [files, setFiles] = useState(AttachmentManager.getFiles(roomId) || []);
    const [failedToUploadFiles, setFailedToUploadFiles] = useState<File[]>([]);
    const showBasicDialog = useShowBasicDialog();
    const canvasRef = useRef<HTMLCanvasElement>();

    const messageType = files.length > 0 ? "files" : "text";

    const handleSend = async () => {
        const failed: File[] = [];
        let response;

        if (messageType !== "text") {
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

                    response = await sendMessage({
                        roomId,
                        type: fileType,
                        body: {
                            fileId: uploaded.id,
                            thumbId: thumbFileUploaded ? thumbFileUploaded.id : uploaded.id,
                        },
                    }).unwrap();
                    setFilesSent((filesSent) => filesSent + 1);

                    if (response && response.message) {
                        dispatch(addMessage(response.message));
                        dispatch(fetchHistory({ page: 1, keyword: "" }));
                    }
                } catch (error) {
                    showBasicDialog({ text: "Some files are not sent!", title: "Upload error" });
                    failed.push(file);
                    console.log({ failed: file, error });
                }
            }

            AttachmentManager.setFiles({ roomId, files: failed });
            setFailedToUploadFiles(failed);
            setLoading(false);
            setFilesSent(0);
        } else if (message.length) {
            const messageTmp: string = message + "";
            handleSetMessageText("");
            response = await sendMessage({
                roomId,
                type: "text",
                body: { text: messageTmp },
            }).unwrap();

            if (response && response.message) {
                dispatch(addMessage(response.message));
                dispatch(fetchHistory({ page: 1, keyword: "" }));
            }
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
                        messageType={messageType}
                        loading={loading}
                        message={message}
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
    messageType: string;
    loading: boolean;
    message: string;
    handleSetMessageText: (string) => void;
    handleSend: () => void;
    files: File[];
    failedToUploadFiles: File[];
};

function ChatInput({
    messageType,
    loading,
    message,
    handleSetMessageText,
    handleSend,
    files,
    failedToUploadFiles,
}: ChatInputProps) {
    const dispatch = useDispatch();
    const editMessage = useSelector(selectEditMessage);
    const [callEditMessage, { isLoading }] = useEditMessageMutation();

    const onSend = async () => {
        if (!editMessage) {
            return handleSend();
        }

        await callEditMessage({ id: editMessage.id, text: message }).unwrap();
        handleCloseEdit();
    };

    const handleCloseEdit = () => {
        dispatch(setEditMessage(null));
        handleSetMessageText("");
    };

    const generateMessageTextButtons = () => {
        if (editMessage) {
            if (isLoading) {
                return (
                    <Box>
                        <CircularProgress sx={{ ml: 0 }} />
                    </Box>
                );
            }

            return (
                <Box display="flex">
                    <Button onClick={handleCloseEdit} variant="outlined" sx={{ mr: 1 }}>
                        Cancel
                    </Button>
                    <Button onClick={onSend} variant="contained">
                        Save
                    </Button>
                </Box>
            );
        }

        if (message.length) {
            return <SendIcon onClick={() => onSend()} color="primary" sx={{ cursor: "pointer" }} />;
        }

        return <KeyboardVoiceIcon fontSize="large" color="primary" />;
    };

    if (messageType === "text") {
        return (
            <>
                <Box width="100%" position="relative">
                    <Input
                        disableUnderline={true}
                        fullWidth
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
                        sx={{
                            border: "1px solid #C9C9CA",
                            input: {
                                py: 2,
                                px: 1.5,
                            },
                            padding: "10px",
                        }}
                        multiline={true}
                        maxRows={3}
                    />
                    <EmojiEmotionsIcon
                        color="primary"
                        sx={{ position: "absolute", top: "11px", right: "20px" }}
                    />
                </Box>
                {generateMessageTextButtons()}
            </>
        );
    }

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
