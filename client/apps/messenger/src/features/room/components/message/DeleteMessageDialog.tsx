import React, { useState } from "react";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Button from "@mui/material/Button";
import Close from "@mui/icons-material/Close";
import { useDeleteMessageMutation } from "../../api/message";
import MessageType from "../../../../types/Message";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    hideDeleteModal,
    selectActiveMessage,
    selectShowDeleteMessage,
} from "../../slices/messages";
import { selectUser } from "../../../../store/userSlice";
import useStrings from "../../../../hooks/useStrings";
import { useAppDispatch } from "../../../../hooks";

export default function DeleteMessageDialogContainer() {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useAppDispatch();
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
    const strings = useStrings();

    const me = useSelector(selectUser);
    const [deleteMessage, { isLoading }] = useDeleteMessageMutation();
    const [target, setTarget] = useState<"all" | "user">("user");

    const handleSubmit = async () => {
        await deleteMessage({ id: message.id, target }).unwrap();
        onClose();
    };

    return (
        <Dialog
            onClose={onClose}
            open={true}
            maxWidth="xs"
            sx={{ "& .MuiDialog-paper": { width: "100%" } }}
        >
            <DialogTitle sx={{ textAlign: "center" }}>{strings.delete}</DialogTitle>
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
                            label={strings.deleteForEveryone}
                            disabled={me.id !== message.fromUserId}
                        />
                        <FormControlLabel
                            value="user"
                            control={<Radio />}
                            label={strings.deleteForMe}
                        />
                    </RadioGroup>
                </FormControl>

                <Button onClick={handleSubmit} fullWidth variant="contained" disabled={isLoading}>
                    {strings.delete}
                </Button>
            </Box>
        </Dialog>
    );
}
