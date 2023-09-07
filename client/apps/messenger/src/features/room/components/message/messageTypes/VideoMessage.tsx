import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import Modal from "@mui/material/Modal";
import { useParams } from "react-router-dom";

import CloseOutlined from "@mui/icons-material/CloseOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import AttachmentManager from "../../../lib/AttachmentManager";
import PlayCircleFilled from "@mui/icons-material/PlayCircleFilled";
import TextMessage from "./TextMessage";
import { DOWNLOAD_URL } from "../../../../../../../../lib/constants";
import useEscapeKey from "../../../../../hooks/useEscapeKey";

type VideoMessageTypes = {
    body: any;
    isUsersMessage: boolean;
    onClick: () => void;
    progress?: number;
    highlighted?: boolean;
};

export default function VideoMessage({
    body,
    isUsersMessage,
    onClick,
    progress,
    highlighted,
}: VideoMessageTypes) {
    const roomId = parseInt(useParams().id || "");
    const [open, setOpen] = useState(false);
    const [thumbSrc, setThumbSrc] = useState<string>();
    const [src, setSrc] = useState<string>();
    const [mimeType, setMimeType] = useState<string>();
    const isUploading = progress !== undefined && progress < 100;
    const isVerifying = progress !== undefined && progress === 100;

    useEffect(() => {
        const { uploadingFileName, thumbId, file: fileFromServer } = body || {};

        const localFile =
            uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });

        if (thumbId) {
            setThumbSrc(`${DOWNLOAD_URL}/${thumbId}`);
        }

        const file = localFile || fileFromServer;
        if (file) {
            setSrc(localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${body.fileId}`);
            setMimeType(localFile ? file.type : file.mimeType);
        }
    }, [body, roomId]);

    const handleOpen = () => {
        setOpen(true);
        onClick();
    };
    const handleClose = () => setOpen(false);

    useEscapeKey(handleClose);

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    return (
        <>
            {body.text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box position="relative" onClick={handleOpen}>
                <Box
                    component={thumbSrc ? "img" : "video"}
                    borderRadius="0.625rem"
                    maxWidth="256px"
                    height="10vh"
                    minHeight="128px"
                    display="block"
                    border={highlighted ? "2px solid #d7aa5a" : "2px solid transparent"}
                    boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.15)"
                    src={thumbSrc || src}
                    pb="0.8125"
                    draggable={false}
                    sx={{
                        cursor: "pointer",
                        objectFit: "contain",
                        filter:
                            isVerifying || isUploading
                                ? "blur(4px) brightness(55%)"
                                : "brightness(55%)",
                        userSelect: "none",
                        touchAction: "none",
                    }}
                />
                {isUploading || isVerifying ? (
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: "white",
                            fontWeight: "bold",
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
                ) : (
                    <PlayCircleFilled
                        fontSize="large"
                        sx={{
                            position: "absolute",
                            inset: 0,
                            margin: "auto",
                            cursor: "pointer",
                        }}
                    />
                )}
            </Box>
            <Modal open={open} onClose={handleClose}>
                <>
                    <Box display="flex" gap={2} justifyContent="end" mr={2} mt={2}>
                        <Box
                            component="a"
                            href={src}
                            target="_blank"
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
                            component="video"
                            maxWidth="92vw"
                            maxHeight="92vh"
                            height="auto"
                            controls
                            autoPlay
                            draggable={false}
                            sx={{
                                userSelect: "none",
                            }}
                        >
                            <source type={mimeType} src={src} />
                            Your browser does not support the video tag.
                        </Box>
                    </Box>
                </>
            </Modal>
        </>
    );
}
