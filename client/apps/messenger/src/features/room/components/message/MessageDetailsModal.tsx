import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Avatar,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Skeleton,
} from "@mui/material";
import { Close, DoneAll } from "@mui/icons-material";

import MessageType, { MessageRecordType } from "../../../../types/Message";
import { selectUser } from "../../../../store/userSlice";
import { useGetMessageRecordsByIdQuery } from "../../api/message";
import dayjs from "dayjs";
import { useGetUserByIdQuery } from "../../api/user";
import { useParams } from "react-router-dom";
import {
    hideMessageDetails,
    selectActiveMessage,
    selectShowMessageDetails,
} from "../../slices/messages";

declare const UPLOADS_BASE_URL: string;

export default function MessageDetailsDialogContainer() {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useDispatch();
    const activeMessage = useSelector(selectActiveMessage(roomId));
    const showMessageDetails = useSelector(selectShowMessageDetails(roomId));

    if (!activeMessage || !showMessageDetails) {
        return null;
    }

    const handleClose = () => {
        dispatch(hideMessageDetails(roomId));
    };

    return <MessageDetailsDialog message={activeMessage} onClose={handleClose} />;
}

function MessageDetailsDialog({ message, onClose }: { message: MessageType; onClose: () => void }) {
    const me = useSelector(selectUser);

    const { data } = useGetMessageRecordsByIdQuery(message.id);

    const messageRecords = data?.messageRecords || [];

    const seenMembers = messageRecords.filter((mr) => mr.type === "seen" && mr.userId !== me.id);
    const deliveredMembers = messageRecords.filter(
        (mr) =>
            mr.type === "delivered" &&
            mr.userId !== me.id &&
            !seenMembers.find((s) => s.userId === mr.userId)
    );

    return (
        <Dialog onClose={onClose} open={true}>
            <Box
                sx={{
                    width: "400px",
                }}
            >
                <DialogTitle sx={{ textAlign: "center" }}>Details</DialogTitle>
                <IconButton
                    disableRipple
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
                <Box m="0px 10px 0px 10px">
                    Message sent at{" "}
                    {dayjs.unix(message.createdAt / 1000).format("hh:mm, dddd, MMM D")}
                </Box>
                {message.createdAt !== message.modifiedAt && (
                    <Box m="0px 10px 0px 10px">
                        Message edited at{" "}
                        {dayjs.unix(message.modifiedAt / 1000).format("hh:mm, dddd, MMM D")}
                    </Box>
                )}
                {seenMembers.length > 0 && (
                    <Box m="10px 10px 0px 10px">
                        <Box display="flex" justifyContent="space-between">
                            <Box sx={{ fontWeight: "bold", marginBottom: "5px" }}>Read by</Box>
                            <DoneAll color="info" />
                        </Box>
                        <List sx={{ pt: 0 }}>
                            {seenMembers.map((member) => (
                                <MessageDetailRow record={member} key={member.id} />
                            ))}
                        </List>
                    </Box>
                )}
                {deliveredMembers.length > 0 && (
                    <Box m="10px 10px 0px 10px">
                        <Box display="flex" justifyContent="space-between">
                            <Box sx={{ fontWeight: "bold", marginBottom: "5px" }}>Delivered to</Box>
                            <DoneAll />
                        </Box>

                        <List sx={{ pt: 0 }}>
                            {deliveredMembers.map((member) => (
                                <MessageDetailRow record={member} key={member.id} />
                            ))}
                        </List>
                    </Box>
                )}
            </Box>
        </Dialog>
    );
}

export interface MessageDetailsRowProps {
    record: MessageRecordType;
}

function MessageDetailRow({ record }: MessageDetailsRowProps) {
    const { data, isLoading } = useGetUserByIdQuery(record.userId);

    return (
        <ListItem key={record.id} sx={{ p: 0 }}>
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <ListItemAvatar>
                        {isLoading ? (
                            <Skeleton variant="circular" width={40} height={40} />
                        ) : (
                            <Avatar src={`${UPLOADS_BASE_URL}${data?.user.avatarUrl}`} />
                        )}
                    </ListItemAvatar>
                    {isLoading ? (
                        <Box>
                            <Skeleton
                                variant="text"
                                animation="wave"
                                width={100}
                                height={20}
                                sx={{ mb: 0.25, display: "block" }}
                            />
                            <Skeleton variant="text" animation="wave" width={100} height={20} />
                        </Box>
                    ) : (
                        <ListItemText
                            primary={data?.user.displayName}
                            secondary={dayjs(record.createdAt).fromNow()}
                        />
                    )}
                </Box>
            </Box>
        </ListItem>
    );
}
