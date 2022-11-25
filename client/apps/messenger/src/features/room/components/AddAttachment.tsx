import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import AttachmentManager from "../lib/AttachmentManager";
import { useSelector } from "react-redux";
import { selectInputType } from "../slices/input";

export default function AddAttachment(): ReactElement {
    const roomId = parseInt(useParams().id || "");
    const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
    const uploadFilesRef = useRef(null);
    const uploadImagesRef = useRef(null);
    const boxRef = useRef(null);
    const [containerBoxRect, setContainerBoxRect] = React.useState<DOMRect>(null);
    const inputType = useSelector(selectInputType(roomId));

    const handleFilesUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (uploadedFiles) {
            AttachmentManager.addFiles({ roomId, files: Array.from(uploadedFiles) });
        }
        setAttachmentMenuOpen(false);
    };

    useEffect(() => {
        const handleResize = () => {
            setContainerBoxRect(boxRef.current.getBoundingClientRect());
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [boxRef]);

    if (inputType === "emoji") {
        return null;
    }

    return (
        <Box
            ref={boxRef}
            sx={{ display: "flex", justifyContent: "center", alignContent: "center" }}
        >
            {attachmentMenuOpen ? (
                <>
                    <Box
                        sx={{
                            position: "absolute",
                            left: `${containerBoxRect.left - 20}px`,
                            top: `${containerBoxRect.bottom - 220}px`,
                            border: "1px solid",
                            borderRadius: "5px",
                            borderColor: "divider",
                            width: "75px",
                            height: "220px",
                            backgroundColor: "background.default",
                            zIndex: 900,
                        }}
                    >
                        <Box
                            mt="25px"
                            sx={{
                                cursor: "pointer",
                                textAlign: "center",
                                "&:hover": {
                                    opacity: 0.8,
                                },
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
                            mt="10px"
                            sx={{
                                cursor: "pointer",
                                textAlign: "center",
                                "&:hover": {
                                    opacity: 0.8,
                                },
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
                        sx={{ cursor: "pointer", zIndex: 1000 }}
                    />
                </>
            ) : (
                <AddIcon
                    color="primary"
                    fontSize="large"
                    onClick={() => setAttachmentMenuOpen(true)}
                    sx={{ cursor: "pointer" }}
                />
            )}
        </Box>
    );
}
