import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
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
    const boxRef = useRef(null);
    const [containerBoxRect, setContainerBoxRect] = React.useState<DOMRect>(null);

    const handleFilesUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (uploadedFiles) {
            AttachmentManager.addFiles({ roomId, files: Array.from(uploadedFiles) });
        }
        setAttachmentMenuOpen(false);
    };

    useEffect(() => {
        setContainerBoxRect(boxRef.current.getBoundingClientRect());
    },[boxRef])

    return <Box ref={boxRef} sx={{ display: "flex", justifyContent: "center", alignContent:"center"}}>
            {attachmentMenuOpen ? 
                <>
                    <Box sx={{
                        position: "absolute",
                        left: `${containerBoxRect.left - 20}px`,
                        top: `${containerBoxRect.bottom - 200}px`,
                        border: "1px solid #C9C9CA",
                        borderRadius: "5px",
                        width : "75px",
                        height: "200px",
                        backgroundColor: "#fff",
                        zIndex: 900
                    }}>
                        <Box
                            mt={"25px"}
                            sx={{ 
                                cursor: "pointer", 
                                textAlign: "center",
                                "&:hover": {
                                    opacity: 0.8
                                } 
                            }}
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
                            sx={{ 
                                cursor: "pointer", 
                                textAlign: "center",
                                "&:hover": {
                                    opacity: 0.8
                                } 
                            }}
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
                    </Box>
                    <CloseIcon
                            color="primary"
                            fontSize="large"
                            onClick={() => setAttachmentMenuOpen(false)}
                            sx={{ cursor: "pointer",zIndex: 1000 }}
                    />
                </> :
                <AddIcon
                    color="primary"
                    fontSize="large"
                    onClick={() => setAttachmentMenuOpen(true)}
                    sx={{ cursor: "pointer" }}
                />
            }
        </Box>
    if (!attachmentMenuOpen) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignContent:"center"}}>
                <AddIcon
                    color="primary"
                    fontSize="large"
                    onClick={() => setAttachmentMenuOpen(true)}
                    sx={{ cursor: "pointer" }}
                />
            </Box>
        );
    }

    return (

        <Box sx={{ display: "flex", justifyContent: "center", alignContent:"center"}}>
            <CloseIcon
                color="primary"
                fontSize="large"
                onClick={() => setAttachmentMenuOpen(false)}
                sx={{ cursor: "pointer" }}
            />
        </Box>

    );
}



{/*
1px solid #C9C9CA

        <Box sx={{ display: "flex", justifyContent: "center", alignContent:"center"}}>
            <CloseIcon
                color="primary"
                fontSize="large"
                onClick={() => setAttachmentMenuOpen(false)}
                sx={{ cursor: "pointer" }}
            />
        </Box>
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
*/}