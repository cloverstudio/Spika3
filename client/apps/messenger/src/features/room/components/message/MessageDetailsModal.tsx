import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";

import Close from "@mui/icons-material/Close";
import DoneAll from "@mui/icons-material/DoneAll";

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
import useStrings from "../../../../hooks/useStrings";

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
    const strings = useStrings();
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
            <Box width={{ md: 428 }} px={2.5} py={2}>
                <DialogTitle sx={{ textAlign: "center", p: 0, mb: 2 }}>
                    {strings.details}
                </DialogTitle>
                <IconButton
                    size="large"
                    sx={{
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        position: "absolute",
                        right: 20,
                        top: 20,
                        p: 0,
                    }}
                    onClick={onClose}
                >
                    <Close />
                </IconButton>

                <Stack spacing={2}>
                    <Box>
                        {strings.messageSentAt}{" "}
                        {dayjs.unix(message.createdAt / 1000).format("hh:mm, dddd, MMM D")}
                    </Box>
                    {message.createdAt !== message.modifiedAt && (
                        <Box>
                            {strings.messageEditedAt}{" "}
                            {dayjs.unix(message.modifiedAt / 1000).format("hh:mm, dddd, MMM D")}
                        </Box>
                    )}
                    {seenMembers.length > 0 && (
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Box sx={{ fontWeight: "bold" }}>{strings.readBy}</Box>
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
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Box sx={{ fontWeight: "bold" }}>{strings.deliveredTo}</Box>
                                <DoneAll />
                            </Box>

                            <List sx={{ pt: 0 }}>
                                {deliveredMembers.map((member) => (
                                    <MessageDetailRow record={member} key={member.id} />
                                ))}
                            </List>
                        </Box>
                    )}
                </Stack>
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
                            <Avatar src={`${UPLOADS_BASE_URL}/${data?.user.avatarFileId}`} />
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
