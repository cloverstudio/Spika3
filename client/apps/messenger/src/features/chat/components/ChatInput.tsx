import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
    Box,
    CircularProgress,
    IconButton,
    Input,
    LinearProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useSendMessageMutation } from "../api/message";
import { useParams } from "react-router-dom";
import AttachmentManager from "../lib/AttachmentManager";
import uploadFile from "../../../utils/uploadFile";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SendIcon from "@mui/icons-material/Send";
import getFileIcon from "../lib/getFileIcon";
import { useShowBasicDialog } from "../../../hooks/useModal";
import { dynamicBaseQuery } from "../../../api/api";
import { addMessage } from "../slice/chatSlice";
import { fetchHistory } from "../slice/roomSlice";

export default function ChatInput(): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = +useParams().id;
    const [sendMessage] = useSendMessageMutation();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [filesSent, setFilesSent] = useState(0);
    const [files, setFiles] = useState(AttachmentManager.getFiles(roomId) || []);
    const [failedToUploadFiles, setFailedToUploadFiles] = useState<File[]>([]);
    const showBasicDialog = useShowBasicDialog();

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

                    const fileType = getFileType(file.type);
                    response = await sendMessage({
                        roomId,
                        type: fileType,
                        body: { fileId: uploaded.id, thumbId: uploaded.id },
                    }).unwrap();
                    setFilesSent((filesSent) => filesSent + 1);

                    if (response && response.message) {
                        dispatch(addMessage(response.message));
                        dispatch(fetchHistory(1));
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
            response = await sendMessage({
                roomId,
                type: "text",
                body: { text: message },
            }).unwrap();

            setMessage("");
            if (response && response.message) {
                dispatch(addMessage(response.message));
                dispatch(fetchHistory(1));
            }
        }
    };

    useEffect(() => {
        AttachmentManager.addEventListener(roomId, (files) => setFiles(files));

        return () => AttachmentManager.removeEventListener(roomId);
    }, [roomId]);

    return (
        <Box borderTop="0.5px solid #C9C9CA" px={2} py={1}>
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

                    {messageType === "text" ? (
                        <>
                            <Box width="100%" position="relative">
                                <Input
                                    disableUnderline={true}
                                    fullWidth
                                    value={message}
                                    disabled={loading}
                                    onChange={({ target }) => setMessage(target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Type here..."
                                    sx={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #C9C9CA",
                                        input: {
                                            py: 2,
                                            px: 1.5,
                                        },
                                    }}
                                />
                                <EmojiEmotionsIcon
                                    fontSize="large"
                                    color="primary"
                                    sx={{ position: "absolute", top: "12px", right: "20px" }}
                                />
                            </Box>
                            {message.length ? (
                                <SendIcon
                                    onClick={() => handleSend()}
                                    fontSize="large"
                                    color="primary"
                                    sx={{ cursor: "pointer" }}
                                />
                            ) : (
                                <KeyboardVoiceIcon fontSize="large" color="primary" />
                            )}
                        </>
                    ) : (
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
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

function AddAttachment() {
    const roomId = +useParams().id;
    const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
    const uploadFilesRef = React.useRef(null);
    const uploadImagesRef = React.useRef(null);

    const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        AttachmentManager.addFiles({ roomId, files: Array.from(uploadedFiles) });
        setAttachmentMenuOpen(false);
    };

    if (!attachmentMenuOpen) {
        return (
            <Paper elevation={0} sx={{ p: 1, textAlign: "center", minWidth: "3.75rem" }}>
                <AddIcon
                    color="primary"
                    fontSize="large"
                    onClick={() => setAttachmentMenuOpen(true)}
                    sx={{ cursor: "pointer" }}
                />
            </Paper>
        );
    }

    return (
        <Box position="relative" minWidth="3.75rem" minHeight="53.7px">
            <Paper
                elevation={2}
                sx={{
                    p: 1,
                    position: "absolute",
                    bottom: "0",
                    textAlign: "center",
                    borderRadius: "0.625rem",
                }}
            >
                <Stack mb={3}>
                    <Box
                        my={2}
                        sx={{ cursor: "pointer" }}
                        onClick={() => uploadFilesRef.current?.click()}
                    >
                        <InsertDriveFileIcon color="primary" fontSize="large" />
                        <Typography fontWeight="medium" color="primary">
                            Files
                        </Typography>
                        <input
                            onChange={handleFilesUpload}
                            type="file"
                            style={{ display: "none" }}
                            ref={uploadFilesRef}
                            multiple
                        />
                    </Box>
                    <Box
                        sx={{ cursor: "pointer" }}
                        onClick={() => uploadImagesRef.current?.click()}
                    >
                        <ImageIcon color="primary" fontSize="large" />
                        <Typography fontWeight="medium" color="primary">
                            Images
                        </Typography>
                        <input
                            onChange={handleFilesUpload}
                            type="file"
                            style={{ display: "none" }}
                            ref={uploadImagesRef}
                            accept="image/*"
                            multiple
                        />
                    </Box>
                </Stack>
                <CloseIcon
                    color="primary"
                    fontSize="large"
                    onClick={() => setAttachmentMenuOpen(false)}
                    sx={{ cursor: "pointer" }}
                />
            </Paper>
        </Box>
    );
}

type AttachmentsProps = {
    files: File[];
    failedToUploadFileNames: string[];
};

function Attachments({ files, failedToUploadFileNames }: AttachmentsProps): React.ReactElement {
    const roomId = +useParams().id;

    return (
        <Box
            width="100%"
            display="flex"
            gap={1}
            ml="4.75rem"
            mb={0.5}
            pb={0.5}
            sx={{ overflowX: "auto" }}
        >
            {files.length > 0 &&
                files.map((file) => {
                    const Icon = getFileIcon(file.type);
                    const isFailed = failedToUploadFileNames.includes(file.name);
                    return (
                        <Box key={file.name} position="relative">
                            <Box
                                width="74px"
                                height="74px"
                                borderRadius="0.625rem"
                                bgcolor="#F2F2F2"
                                textAlign="center"
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-evenly"
                                alignItems="center"
                                sx={{
                                    borderWidth: "2px",
                                    borderColor: isFailed ? "red" : "transparent",
                                    borderStyle: "solid",
                                }}
                            >
                                {file.type?.startsWith("image") ? (
                                    <Box
                                        component="img"
                                        width="72px"
                                        height="72px"
                                        borderRadius="0.625rem"
                                        sx={{ objectFit: "cover" }}
                                        src={URL.createObjectURL(file)}
                                    />
                                ) : (
                                    <>
                                        <Icon fontSize="large" />
                                        <Typography>
                                            {file.name.length > 5
                                                ? file.name.slice(0, 5) + "..."
                                                : file.name}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                            <IconButton
                                sx={{
                                    position: "absolute",
                                    top: "-4px",
                                    right: "-4px",
                                    p: 0,
                                    backgroundColor: "white",
                                }}
                                onClick={() =>
                                    AttachmentManager.removeFile({
                                        roomId,
                                        fileName: file.name,
                                    })
                                }
                            >
                                <CloseIcon color="primary" />
                            </IconButton>
                        </Box>
                    );
                })}
        </Box>
    );
}

function getFileType(htmlType: string): string {
    if (!htmlType) {
        return "unknown";
    }

    if (htmlType.startsWith("image/")) {
        return "image";
    }

    if (htmlType.startsWith("audio/")) {
        return "audio";
    }

    if (htmlType.startsWith("video/")) {
        return "video";
    }

    return "file";
}
