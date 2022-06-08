import React, { useState } from "react";
import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEditMessageMutation } from "../api/message";
import MessageType from "../../../types/Message";

export interface EditMessageDialogProps {
    open: boolean;
    onClose: () => void;
    selectedMessage: MessageType;
}

export default function EditMessageDialog(props: EditMessageDialogProps) {
    const { onClose, open, selectedMessage } = props;
    const [editMessage, { isLoading }] = useEditMessageMutation();
    const [text, setText] = useState<string>(selectedMessage.body.text);

    const handleSubmit = async () => {
        await editMessage({ id: selectedMessage.id, text }).unwrap();
        onClose();
    };

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle sx={{ textAlign: "center" }}>Edit message</DialogTitle>
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    margin: "0",
                    padding: "5px",
                    position: "absolute",
                    right: "10px",
                    top: "12px",
                }}
                onClick={onClose}
            >
                <Close />
            </IconButton>
            <Box width="320px" m="1rem">
                <FormControl sx={{ mb: 4 }}>
                    <TextField
                        multiline
                        rows={2}
                        maxRows={4}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </FormControl>

                <Button onClick={handleSubmit} fullWidth variant="contained" disabled={isLoading}>
                    Edit
                </Button>
            </Box>
        </Dialog>
    );
}
