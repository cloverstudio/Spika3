import React, { ChangeEvent, ReactElement, useRef, useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import AttachmentManager from "../lib/AttachmentManager";

export default function AddAttachment(): ReactElement {
    const roomId = parseInt(useParams().id || "");
    const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
    const uploadFilesRef = useRef(null);
    const uploadImagesRef = useRef(null);

    const handleFilesUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (uploadedFiles) {
            AttachmentManager.addFiles({ roomId, files: Array.from(uploadedFiles) });
        }
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
