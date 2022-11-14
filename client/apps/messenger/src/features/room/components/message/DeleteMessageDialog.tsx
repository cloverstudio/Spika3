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
import { useDeleteMessageMutation } from "../../api/message";
import MessageType from "../../../../types/Message";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    hideDeleteModal,
    selectActiveMessage,
    selectShowDeleteMessage,
} from "../../slices/messages";
import { selectUser } from "../../../../store/userSlice";

export default function DeleteMessageDialogContainer() {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useDispatch();
    const activeMessage = useSelector(selectActiveMessage(roomId));
    const showDeleteMessage = useSelector(selectShowDeleteMessage(roomId));

    if (!activeMessage || !showDeleteMessage) {
        return null;
    }

    const handleClose = () => {
        dispatch(hideDeleteModal(roomId));
    };

    return <DeleteMessageDialog message={activeMessage} onClose={handleClose} />;
}

function DeleteMessageDialog({ message, onClose }: { message: MessageType; onClose: () => void }) {
    const me = useSelector(selectUser);
    const [deleteMessage, { isLoading }] = useDeleteMessageMutation();
    const [target, setTarget] = useState<"all" | "user">("user");

    const handleSubmit = async () => {
        await deleteMessage({ id: message.id, target }).unwrap();
        onClose();
    };

    return (
        <Dialog onClose={onClose} open={true}>
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
                            disabled={me.id !== message.fromUserId}
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
