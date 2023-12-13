import React, { useState } from "react";

import CloseOutlined from "@mui/icons-material/CloseOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import { Box, CircularProgress, Modal } from "@mui/material";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { selectMessageById, setPreviewedImageMessageId } from "../../slices/messages";
import AttachmentManager from "../../lib/AttachmentManager";
import { DOWNLOAD_URL } from "../../../../../../../lib/constants";
import useEscapeKey from "../../../../hooks/useEscapeKey";

export const ImagePreviewModal = () => {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useAppDispatch();

    const selectedMessageId = useAppSelector((state) => state.messages.previewedImageMessageId);

    const message = useAppSelector(selectMessageById(roomId, selectedMessageId));

    const handleClose = () => {
        setImageLoaded(false);
        dispatch(setPreviewedImageMessageId(null));
    };

    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageLoaded = () => {
        setImageLoaded(true);
    };

    useEscapeKey(handleClose);

    if (!selectedMessageId || !message) {
        return null;
    }

    const { body } = message;

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    const { file: fileFromServer, uploadingFileName, fileId, thumbId } = body;

    const localFile =
        uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });
    const file = localFile || fileFromServer;

    if (!file) {
        return null;
    }
    const imgSrc = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${fileId}`;
    const thumbSrc = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${thumbId}`;

    return (
        <Modal open={!!file} onClose={handleClose}>
            <>
                <Box display="flex" gap={2} justifyContent="end" mr={2} mt={2}>
                    <Box
                        component="a"
                        href={imgSrc}
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
                    {!imageLoaded && (
                        <Box>
                            {thumbSrc && (
                                <Box
                                    component="img"
                                    maxHeight="92vh"
                                    maxWidth="92vw"
                                    height="auto"
                                    width="auto"
                                    src={thumbSrc}
                                    draggable={false}
                                    sx={{
                                        userSelect: "none",
                                        touchAction: "none",
                                        pointerEvents: "none",
                                    }}
                                />
                            )}
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        </Box>
                    )}
                    <Box
                        component="img"
                        maxWidth="92vw"
                        maxHeight="92vh"
                        height={imageLoaded ? "auto" : "0px"}
                        width={imageLoaded ? "auto" : "0px"}
                        src={imgSrc}
                        draggable={false}
                        sx={{
                            userSelect: "none",
                            touchAction: "none",
                            pointerEvents: "none",
                            visibility: imageLoaded ? "visible" : "hidden",
                        }}
                        onLoad={handleImageLoaded}
                    />
                </Box>
            </>
        </Modal>
    );
};
