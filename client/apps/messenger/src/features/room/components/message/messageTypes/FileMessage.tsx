import React from "react";
import { Box, CircularProgress } from "@mui/material";
import Typography from "@mui/material/Typography";

import getFileIcon from "../../../lib/getFileIcon";
import DownloadIcon from "@mui/icons-material/Download";
import { useParams } from "react-router-dom";
import AttachmentManager from "../../../lib/AttachmentManager";
import TextMessage from "./TextMessage";
import { DOWNLOAD_URL } from "../../../../../../../../lib/constants";

type FileMessageType = {
    body: any;
    isUsersMessage: boolean;
    progress?: number;
    highlighted?: boolean;
};

export default function FileMessage({
    body,
    isUsersMessage,
    progress,
    highlighted,
}: FileMessageType) {
    const roomId = parseInt(useParams().id || "");
    const isUploading = progress !== undefined && progress < 100;
    const isVerifying = progress !== undefined && progress === 100;

    if (!body.file && !body.uploadingFileName) {
        return null;
    }

    const { file: fileFromServer, uploadingFileName, text } = body;
    const localFile =
        uploadingFileName && AttachmentManager.getFile({ roomId, fileName: uploadingFileName });
    const file = localFile || fileFromServer;

    const href = localFile ? URL.createObjectURL(file) : `${DOWNLOAD_URL}/${body.fileId}`;
    const mimeType = localFile ? file.type : file.mimeType;
    const name = localFile ? file.name : file.fileName;

    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    const sizeInKB = (file.size / 1024).toFixed(2);

    const Icon = getFileIcon(mimeType);
    return (
        <>
            {text && (
                <TextMessage
                    highlighted={highlighted}
                    body={body}
                    isUsersMessage={isUsersMessage}
                />
            )}
            <Box
                display="flex"
                alignItems="center"
                borderRadius="0.625rem"
                maxWidth="35rem"
                p="1.25rem"
                gap="1.25rem"
                bgcolor={
                    highlighted
                        ? "#d7aa5a"
                        : isUsersMessage
                        ? "common.myMessageBackground"
                        : "background.paper"
                }
                boxShadow="0 2px 5px 0 rgba(0, 0, 0, 0.15)"
            >
                <Icon fontSize="large" />
                <Box overflow="hidden">
                    <Typography
                        fontSize="1rem"
                        fontWeight={800}
                        lineHeight="1.1rem"
                        mb={0.25}
                        sx={{
                            wordBreak: "break-word",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            WebkitLineClamp: 2,
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {name}
                    </Typography>
                    <Typography textAlign="left">
                        {+sizeInMB > 0 ? `${sizeInMB} MB` : `${sizeInKB} KB`}
                    </Typography>
                </Box>

                {isUploading || isVerifying ? (
                    <Box
                        sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
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
                    <Box
                        component="a"
                        href={href}
                        target="_blank"
                        download
                        sx={{ display: "block", color: "inherit" }}
                    >
                        <DownloadIcon fontSize="large" />
                    </Box>
                )}
            </Box>
        </>
    );
}
