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
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useDeleteMessageMutation } from "../api/message";

export interface DeleteMessageDialogProps {
    open: boolean;
    onClose: () => void;
    messageId: number;
    isUserMessage: boolean;
}

export default function DeleteMessageDialog(props: DeleteMessageDialogProps) {
    const { onClose, open, messageId, isUserMessage } = props;
    const [deleteMessage, { isLoading }] = useDeleteMessageMutation();
    const [target, setTarget] = useState<"all" | "user">("user");

    const handleSubmit = async () => {
        await deleteMessage({ id: messageId, target }).unwrap();
        onClose();
    };

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle sx={{ textAlign: "center" }}>Delete</DialogTitle>
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
                    <RadioGroup
                        defaultValue="user"
                        value={target}
                        onChange={(e) => {
                            setTarget(e.target.value as "all" | "user");
                        }}
                        name="radio-buttons-group"
                    >
                        <FormControlLabel
                            value="all"
                            control={<Radio />}
                            label="Delete for everyone"
                            disabled={!isUserMessage}
                        />
                        <FormControlLabel value="user" control={<Radio />} label="Delete for me" />
                    </RadioGroup>
                </FormControl>

                <Button onClick={handleSubmit} fullWidth variant="contained" disabled={isLoading}>
                    Delete
                </Button>
            </Box>
        </Dialog>
    );
}
