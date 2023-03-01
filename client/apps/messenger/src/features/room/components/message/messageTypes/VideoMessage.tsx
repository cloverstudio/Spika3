import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Modal from "@mui/material/Modal";
import { useParams } from "react-router-dom";

import CloseOutlined from "@mui/icons-material/CloseOutlined";
import AttachmentManager from "../../../lib/AttachmentManager";
import { PlayCircleFilled } from "@mui/icons-material";
import TextMessage from "./TextMessage";
import { DOWNLOAD_URL } from "../../../../../../../../lib/constants";

type VideoMessageTypes = {
    body: any;
    isUsersMessage: boolean;
    onClick: () => void;
    progress?: number;
};

export default function VideoMessage({
    body,
    isUsersMessage,
    onClick,
    progress,
}: VideoMessageTypes) {
    const roomId = parseInt(useParams().id || "");
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
        onClick();
    };
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };
        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    const { file: fileFromServer, text, uploadingFileName } = body;
    const localFile =
        uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });
    const file = localFile || fileFromServer;

    const src = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${body.fileId}`;
    const thumbSrc = localFile ? null : `${DOWNLOAD_URL}/${body.thumbId}`;
    const mimeType = localFile ? file.type : file.mimeType;

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "transparent",
        outline: "none",
        lineHeight: "1",
    };

    return (
        <>
            {text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box position="relative" onClick={handleOpen}>
                <Box
                    component="img"
                    borderRadius="0.625rem"
                    maxWidth="256px"
                    height="10vh"
                    src={thumbSrc}
                    pb="0.8125"
                    sx={{ cursor: "pointer", objectFit: "contain", bgcolor: "transparent" }}
                />
                <PlayCircleFilled
                    fontSize="large"
                    sx={{
                        position: "absolute",
                        inset: 0,
                        margin: "auto",
                        cursor: "pointer",
                    }}
                />
            </Box>
            <Modal open={open} onClose={handleClose}>
                <>
                    <Box textAlign="right" mr={2} mt={2}>
                        <CloseOutlined
                            onClick={handleClose}
                            sx={{ color: "white", cursor: "pointer" }}
                            fontSize="large"
                        />
                    </Box>

                    <Box sx={style}>
                        <Box
                            component="video"
                            maxWidth="92vw"
                            maxHeight="92vh"
                            height="auto"
                            controls
                            autoPlay
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
