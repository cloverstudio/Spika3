import React, { useState } from "react";
import { useParams } from "react-router-dom";
import AttachmentManager from "../../../lib/AttachmentManager";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import Modal from "@mui/material/Modal";
import { Box, CircularProgress, Typography } from "@mui/material";
import TextMessage from "./TextMessage";
import { DOWNLOAD_URL } from "../../../../../../../../lib/constants";
import useEscapeKey from "../../../../../hooks/useEscapeKey";

type ImageMessageTypes = {
    body: any;
    isUsersMessage: boolean;
    onClick: () => void;
    progress?: number;
    highlighted?: boolean;
};

export default function ImageMessage({
    body,
    isUsersMessage,
    onClick,
    progress,
    highlighted,
}: ImageMessageTypes) {
    const roomId = parseInt(useParams().id || "");
    const [open, setOpen] = useState(false);
    const isUploading = progress !== undefined && progress < 100;
    const isVerifying = progress !== undefined && progress === 100;

    const handleOpen = () => {
        setOpen(true);
        onClick();
    };
    const handleClose = () => setOpen(false);

    useEscapeKey(handleClose);

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    const { file: fileFromServer, uploadingFileName, thumbId, fileId, text } = body;

    const localFile =
        uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });
    const file = localFile || fileFromServer;

    if (!file) {
        return null;
    }
    const thumbSrc = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${thumbId}`;
    const imgSrc = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${fileId}`;

    const imageIsGif = file.mimeType === "image/gif";

    return (
        <>
            {text && (
                <TextMessage
                    body={body}
                    highlighted={highlighted}
                    isUsersMessage={isUsersMessage}
                />
            )}
            <Box position="relative">
                <Box
                    onClick={handleOpen}
                    display="block"
                    component="img"
                    border={highlighted ? "2px solid #d7aa5a" : "2px solid transparent"}
                    borderRadius="0.625rem"
                    maxWidth="256px"
                    height="10vh"
                    minHeight="128px"
                    src={imageIsGif ? imgSrc : thumbSrc}
                    draggable={false}
                    sx={{
                        cursor: "pointer",
                        objectFit: "contain",
                        bgcolor: "transparent",
                        filter: isVerifying || isUploading ? "blur(4px)" : "none",
                        userSelect: "none",
                        touchAction: "none",
                    }}
                />
                {(isUploading || isVerifying) && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: "white",
                            display: "inline-flex",
                        }}
                    >
                        <CircularProgress
                            thickness={6}
                            variant={isUploading ? "determinate" : "indeterminate"}
                            value={progress}
                        />
                        <Box
                            sx={{
                                inset: 0,
                                position: "absolute",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography
                                component="div"
                                fontSize={"0.6rem"}
                                color="text.secondary"
                            >{`${Math.round(progress)}%`}</Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            <Modal open={open} onClose={handleClose}>
                <>
                    <Box display="flex" gap={2} justifyContent="end" mr={2} mt={2}>
                        <Box
                            component="a"
                            href={imgSrc}
                            target="_blank"
                            download
                            sx={{ display: "block", color: "white" }}
                        >
                            <DownloadIcon fontSize="large" />
                        </Box>

                        <CloseOutlined
                            onClick={handleClose}
                            sx={{ color: "white", cursor: "pointer" }}
                            fontSize="large"
                        />
                    </Box>

                    <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        bgcolor="transparent"
                        lineHeight="1"
                        sx={{
                            transform: "translate(-50%, -50%)",
                            outline: "none",
                        }}
                    >
                        <Box
                            onClick={handleOpen}
                            component="img"
                            maxWidth="92vw"
                            maxHeight="92vh"
                            height="auto"
                            src={imgSrc}
                            draggable={false}
                            sx={{
                                userSelect: "none",
                                touchAction: "none",
                                pointerEvents: "none",
                            }}
                        />
                    </Box>
                </>
            </Modal>
        </>
    );
}
