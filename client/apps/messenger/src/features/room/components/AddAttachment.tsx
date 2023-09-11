import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

import { useParams } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import AttachmentManager from "../lib/AttachmentManager";
import { useSelector } from "react-redux";
import { selectInputText, selectInputType } from "../slices/input";
import useStrings from "../../../hooks/useStrings";

export default function AddAttachment(): ReactElement {
    const strings = useStrings();
    const roomId = parseInt(useParams().id || "");
    const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
    const uploadFilesRef = useRef(null);
    const uploadImagesRef = useRef(null);
    const boxRef = useRef(null);
    const [containerBoxRect, setContainerBoxRect] = React.useState<DOMRect>(null);
    const inputType = useSelector(selectInputType(roomId));
    const inputText = useSelector(selectInputText(roomId));

    const handleFilesUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (uploadedFiles) {
            AttachmentManager.addFiles({ roomId, files: Array.from(uploadedFiles) });
        }
        setAttachmentMenuOpen(false);
    };

    useEffect(() => {
        const handleResize = () => {
            if (boxRef.current) {
                setContainerBoxRect(boxRef.current.getBoundingClientRect());
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [boxRef]);

    useEffect(() => {
        if (boxRef?.current && inputText.length === 0) {
            setContainerBoxRect(boxRef.current.getBoundingClientRect());
        } else {
            setAttachmentMenuOpen(false);
        }
    }, [inputType, inputText, boxRef]);

    if (inputType === "emoji") {
        return null;
    }

    if (inputText.length > 0) {
        return null;
    }

    const renderIcon = () => {
        const sharedProps = {
            fontSize: "inherit" as const,
            sx: { cursor: "pointer" },
            color: "primary" as const,
            onClick: () => setAttachmentMenuOpen(!attachmentMenuOpen),
        };

        if (attachmentMenuOpen) {
            return <CloseIcon {...sharedProps} />;
        } else {
            return <AddIcon {...sharedProps} />;
        }
    };

    const getStyle = () => {
        if (attachmentMenuOpen) {
            return {
                borderRadius: "10px",
                backgroundColor: "background.default",
                boxShadow: "0px 4px 20px 0px #00000026",
                minWidth: { xs: "50px", md: "65px" },
                pb: "6px",
                position: "fixed",
                bottom: containerBoxRect
                    ? `${window.innerHeight - containerBoxRect.bottom - 6}px`
                    : "0px",
                zIndex: 1200,
            };
        } else {
            return {};
        }
    };

    return (
        <Box
            ref={boxRef}
            sx={{
                position: "relative",
                overflow: "visible",
                minWidth: { xs: "50px", md: "70px" },
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Box sx={getStyle()}>
                {attachmentMenuOpen && (
                    <Box mt="1rem" mb="1.5rem">
                        <Box
                            sx={{
                                cursor: "pointer",
                                textAlign: "center",
                                "&:hover": {
                                    opacity: 0.8,
                                },
                            }}
                            onClick={() => uploadFilesRef.current?.click()}
                        >
                            <Box fontSize={30} lineHeight={1}>
                                <InsertDriveFileIcon color="primary" fontSize="inherit" />
                            </Box>
                            <Typography
                                fontWeight="medium"
                                fontSize="0.75rem"
                                lineHeight="0.9rem"
                                color="primary"
                            >
                                {strings.files}
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
                            mt="1rem"
                            sx={{
                                cursor: "pointer",
                                textAlign: "center",
                                "&:hover": {
                                    opacity: 0.8,
                                },
                            }}
                            onClick={() => uploadImagesRef.current?.click()}
                        >
                            <Box fontSize={30} lineHeight={1}>
                                <ImageIcon color="primary" fontSize="inherit" />
                            </Box>
                            <Typography
                                fontSize="0.75rem"
                                lineHeight="0.9rem"
                                fontWeight="medium"
                                color="primary"
                            >
                                {strings.library}
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
                )}
                <Box fontSize={30} display="grid" justifyContent="center">
                    {renderIcon()}
                </Box>
            </Box>
        </Box>
    );
}
