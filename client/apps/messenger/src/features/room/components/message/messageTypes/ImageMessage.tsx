import React from "react";
import { useParams } from "react-router-dom";
import AttachmentManager from "../../../lib/AttachmentManager";

import { Box, CircularProgress, Typography } from "@mui/material";
import TextMessage from "./TextMessage";
import { DOWNLOAD_URL } from "../../../../../../../../lib/constants";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAppDispatch } from "../../../../../hooks";
import { setPreviewedImageMessageId } from "../../../slices/messages";

type ImageMessageTypes = {
    body: any;
    isUsersMessage: boolean;
    onClick: () => void;
    progress?: number;
    highlighted?: boolean;
    showBoxShadow?: boolean;
    isReply?: boolean;
    id: number;
};

export default function ImageMessage({
    body,
    isUsersMessage,
    onClick,
    progress,
    highlighted,
    showBoxShadow = true,
    isReply,
    id,
}: ImageMessageTypes) {
    const roomId = parseInt(useParams().id || "");
    const isUploading = progress !== undefined && progress < 100;
    const isVerifying = progress !== undefined && progress === 100;

    const dispatch = useAppDispatch();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleOpen = () => {
        dispatch(setPreviewedImageMessageId(id));
        onClick();
    };

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
                    height="10vh"
                    src={imageIsGif ? imgSrc : thumbSrc}
                    draggable={false}
                    sx={{
                        cursor: "pointer",
                        objectFit: "contain",
                        bgcolor: "transparent",
                        filter: isVerifying || isUploading ? "blur(4px)" : "none",
                        userSelect: "none",
                        touchAction: "none",
                        ...(showBoxShadow && { boxShadow: "0 2px 5px 0 rgba(0, 0, 0, 0.10)" }),
                        ...(isMobile
                            ? {
                                  maxWidth: isReply ? "180px" : "200px",
                                  minHeight: isReply ? "90px" : "100px",
                              }
                            : { maxWidth: "256px", minHeight: "128px" }),
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
        </>
    );
}
