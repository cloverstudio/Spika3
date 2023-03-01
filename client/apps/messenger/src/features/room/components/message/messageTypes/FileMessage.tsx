import React from "react";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

import getFileIcon from "../../../lib/getFileIcon";
import DownloadIcon from "@mui/icons-material/Download";
import { useParams } from "react-router-dom";
import AttachmentManager from "../../../lib/AttachmentManager";
import TextMessage from "./TextMessage";
import { DOWNLOAD_URL } from "../../../../../../../../lib/constants";

export default function FileMessage({
    body,
    isUsersMessage,
}: {
    body: any;
    isUsersMessage: boolean;
}) {
    const roomId = parseInt(useParams().id || "");

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
            {text && <TextMessage body={body} isUsersMessage={isUsersMessage} />}
            <Box
                display="flex"
                alignItems="center"
                borderRadius="0.625rem"
                maxWidth="35rem"
                p="1.25rem"
                gap="1.25rem"
                bgcolor={isUsersMessage ? "common.myMessageBackground" : "background.paper"}
            >
                <Icon fontSize="large" />
                <Box>
                    <Typography fontSize="1rem" fontWeight={800} lineHeight="1.1rem" mb={0.25}>
                        {name}
                    </Typography>
                    <Typography textAlign="left">
                        {+sizeInMB > 0 ? `${sizeInMB} MB` : `${sizeInKB} KB`}
                    </Typography>
                </Box>
                <Box
                    component="a"
                    href={href}
                    target="_blank"
                    download
                    sx={{ display: "block", color: "inherit" }}
                >
                    <DownloadIcon fontSize="large" />
                </Box>
            </Box>
        </>
    );
}
