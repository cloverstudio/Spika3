import React, { useState } from "react";
import { Box, Input, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";

type ChatInputProps = {
    handleSend: (message: string) => void;
};

export default function ChatInput({ handleSend }: ChatInputProps): React.ReactElement {
    const [message, setMessage] = useState("");

    return (
        <Box
            minHeight="80px"
            borderTop="0.5px solid #C9C9CA"
            display="flex"
            alignItems="center"
            px={2}
        >
            <Stack spacing={2} direction="row" alignItems="center" width="100%">
                <AttachmentMenu />
                <Box width="100%" position="relative">
                    <Input
                        disableUnderline={true}
                        fullWidth
                        value={message}
                        onChange={({ target }) => setMessage(target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSend(message);
                                setMessage("");
                            }
                        }}
                        placeholder="Type here..."
                        sx={{
                            backgroundColor: "#fff",
                            border: "1px solid #C9C9CA",
                            input: {
                                py: 2,
                                px: 1.5,
                            },
                        }}
                    />
                    <EmojiEmotionsIcon
                        fontSize="large"
                        color="primary"
                        sx={{ position: "absolute", top: "12px", right: "20px" }}
                    />
                </Box>
                <KeyboardVoiceIcon fontSize="large" color="primary" />
            </Stack>
        </Box>
    );
}

function AttachmentMenu() {
    const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);

    if (!attachmentMenuOpen) {
        return (
            <Paper elevation={0} sx={{ p: 1, textAlign: "center", minWidth: "3.75rem" }}>
                <AddIcon
                    color="primary"
                    fontSize="large"
                    onClick={() => setAttachmentMenuOpen(true)}
                />
            </Paper>
        );
    }

    return (
        <Box position="relative" minWidth="3.75rem" minHeight="53.7px">
            <Paper
                elevation={2}
                sx={{ p: 1, position: "absolute", bottom: "0", textAlign: "center" }}
            >
                <Stack>
                    <Box mb={1}>
                        <InsertDriveFileIcon color="primary" fontSize="large" />
                        <Typography fontWeight="medium" color="primary">
                            File
                        </Typography>
                    </Box>
                    <Box mb={1}>
                        <ImageIcon color="primary" fontSize="large" />
                        <Typography fontWeight="medium" color="primary">
                            Image
                        </Typography>
                    </Box>
                </Stack>
                <CloseIcon
                    color="primary"
                    fontSize="large"
                    onClick={() => setAttachmentMenuOpen(false)}
                />
            </Paper>
        </Box>
    );
}
