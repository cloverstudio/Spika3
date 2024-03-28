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
import { useDeleteManyMessagesMutation } from "../../api/message";
import MessageType from "../../../../types/Message";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    hideDeleteModal,
    resetActiveMessageIds,
    selectActiveMessageIds,
    selectShowDeleteMessage,
    setIsSelectingMessagesActive,
} from "../../slices/messages";
import { selectUser } from "../../../../store/userSlice";
import useStrings from "../../../../hooks/useStrings";
import { useAppDispatch, useAppSelector } from "../../../../hooks";

export default function DeleteMessageDialogContainer() {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useAppDispatch();
    const activeMessageIds = useAppSelector((state) => selectActiveMessageIds(state, roomId)) || [];
    const showDeleteMessage = useSelector(selectShowDeleteMessage(roomId));

    const messages = useAppSelector((state) => state.messages[roomId]?.messages);

    const activeMessages = activeMessageIds.map((id) => messages[id]);

    if (
        !activeMessages.length ||
        activeMessages.some((message) => !message) ||
        !showDeleteMessage
    ) {
        return null;
    }

    const handleClose = () => {
        dispatch(hideDeleteModal(roomId));
    };

    return <DeleteMessageDialog messages={activeMessages} onClose={handleClose} />;
}

function DeleteMessageDialog({
    messages,
    onClose,
}: {
    messages: MessageType[];
    onClose: () => void;
}) {
    const strings = useStrings();
    const roomId = parseInt(useParams().id || "");
    const dispatch = useAppDispatch();

    const me = useSelector(selectUser);
    const [deleteMessages, { isLoading }] = useDeleteManyMessagesMutation();
    const [target, setTarget] = useState<"all" | "user">("user");
    const isSelectingMessagesActive = useAppSelector(
        (state) => state.messages[roomId]?.isSelectingMessagesActive,
    );

    const handleSubmit = async () => {
        await deleteMessages({ messageIds: messages.map((m) => m.id), target }).unwrap();
        dispatch(resetActiveMessageIds({ roomId }));
        if (isSelectingMessagesActive) {
            dispatch(setIsSelectingMessagesActive({ roomId, isSelectingMessagesActive: false }));
        }
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
                            disabled={messages.some((m) => m.fromUserId !== me.id)}
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
