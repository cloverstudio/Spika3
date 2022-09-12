import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import AttachmentManager from "../lib/AttachmentManager";
import getFileIcon from "../lib/getFileIcon";
type AttachmentsProps = {
    files: File[];
    failedToUploadFileNames: string[];
};

export default function Attachments({
    files,
    failedToUploadFileNames,
}: AttachmentsProps): React.ReactElement {
    const roomId = parseInt(useParams().id || "");

    return (
        <Box
            width="100%"
            display="flex"
            gap={1}
            ml="4.75rem"
            mb={0.5}
            pb={0.5}
            sx={{ overflowX: "auto" }}
        >
            {files.length > 0 &&
                files.map((file) => {
                    const Icon = getFileIcon(file.type);
                    const isFailed = failedToUploadFileNames.includes(file.name);
                    return (
                        <Box key={file.name} position="relative">
                            <Box
                                width="74px"
                                height="74px"
                                borderRadius="0.625rem"
                                bgcolor="common.chatBackground"
                                textAlign="center"
                                display="flex"
                                flexDirection="column"
                                justifyContent="space-evenly"
                                alignItems="center"
                                sx={{
                                    borderWidth: "2px",
                                    borderColor: isFailed ? "red" : "transparent",
                                    borderStyle: "solid",
                                }}
                            >
                                {file.type?.startsWith("image") ? (
                                    <Box
                                        component="img"
                                        width="72px"
                                        height="72px"
                                        borderRadius="0.625rem"
                                        sx={{ objectFit: "cover" }}
                                        src={URL.createObjectURL(file)}
                                    />
                                ) : (
                                    <>
                                        <Icon fontSize="large" />
                                        <Typography>
                                            {file.name.length > 5
                                                ? file.name.slice(0, 5) + "..."
                                                : file.name}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                            <IconButton
                                sx={{
                                    position: "absolute",
                                    top: "-4px",
                                    right: "-4px",
                                    p: 0,
                                    backgroundColor: "white",
                                }}
                                onClick={() =>
                                    AttachmentManager.removeFile({
                                        roomId,
                                        fileName: file.name,
                                    })
                                }
                            >
                                <CloseIcon color="primary" />
                            </IconButton>
                        </Box>
                    );
                })}
        </Box>
    );
}
