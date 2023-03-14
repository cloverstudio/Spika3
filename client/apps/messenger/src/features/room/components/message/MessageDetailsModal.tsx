import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import { Box, Typography } from "@mui/material";
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
import DoneIcon from "@mui/icons-material/Done";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";

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
import { ImportExport } from "@mui/icons-material";

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

    const { data } = useGetMessageRecordsByIdQuery(message.id, { refetchOnMountOrArgChange: true });

    const messageRecords = data?.messageRecords || [];

    const seenMembers = messageRecords.filter(
        (mr) => mr.type === "seen" && mr.userId !== me.id && mr.userId !== message.fromUserId
    );
    const deliveredMembers = messageRecords.filter(
        (mr) =>
            mr.type === "delivered" &&
            mr.userId !== me.id &&
            mr.userId !== message.fromUserId &&
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
                    <SenderActions message={message} />

                    {seenMembers.length > 0 && (
                        <Box>
                            <Box display="flex" alignItems="center" mb={2.25} gap={0.5}>
                                <DoneAll color="info" sx={{ width: 16, height: 16 }} />
                                <Typography fontSize="0.85rem">{strings.readBy}</Typography>
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
                            <Box display="flex" alignItems="center" mb={2.25} gap={0.5}>
                                <DoneAll sx={{ width: 16, height: 16 }} />
                                <Typography fontSize="0.85rem">{strings.deliveredTo}</Typography>
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
        <ListItem key={record.id} sx={{ p: 0, display: "block", mb: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                    <ListItemAvatar>
                        {isLoading ? (
                            <Skeleton variant="circular" width={40} height={40} />
                        ) : (
                            <Avatar src={`${UPLOADS_BASE_URL}/${data?.user.avatarFileId}`} />
                        )}
                    </ListItemAvatar>
                    {isLoading ? (
                        <Skeleton
                            variant="text"
                            animation="wave"
                            width={100}
                            height={20}
                            sx={{ mb: 0.25, display: "block" }}
                        />
                    ) : (
                        <ListItemText primary={data?.user.displayName} />
                    )}
                </Box>
                <Typography fontSize="0.85rem">
                    {dayjs.unix(record.createdAt / 1000).format("D.M.YYYY. HH:mm")}
                </Typography>
            </Box>
        </ListItem>
    );
}

function SenderActions({ message }: { message: MessageType }) {
    const strings = useStrings();
    const { data, isLoading } = useGetUserByIdQuery(message.fromUserId);

    return (
        <Box mb={2.75}>
            <Box display="flex" alignItems="center" mb={2.25} gap={0.5}>
                <ImportExport sx={{ width: 16, height: 16 }} />
                <Typography fontSize="0.85rem">{strings.senderActions}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                    <ListItemAvatar>
                        {isLoading ? (
                            <Skeleton variant="circular" width={40} height={40} />
                        ) : (
                            <Avatar src={`${UPLOADS_BASE_URL}/${data?.user.avatarFileId}`} />
                        )}
                    </ListItemAvatar>
                    {isLoading ? (
                        <Skeleton
                            variant="text"
                            animation="wave"
                            width={100}
                            height={20}
                            sx={{ display: "block" }}
                        />
                    ) : (
                        <ListItemText primary={data?.user.displayName} />
                    )}
                </Box>
                <Box>
                    <Box display="flex" alignItems="center" gap={1.25}>
                        <Typography fontSize="0.85rem">
                            {dayjs.unix(message.createdAt / 1000).format("D.M.YYYY. HH:mm")}
                        </Typography>
                        <DoneIcon sx={{ width: 14 }} />
                    </Box>
                    {message.createdAt !== message.modifiedAt && (
                        <Box display="flex" alignItems="center" gap={1.25}>
                            <Typography fontSize="0.85rem">
                                {dayjs.unix(message.modifiedAt / 1000).format("D.M.YYYY. HH:mm")}
                            </Typography>
                            <CreateOutlinedIcon sx={{ width: 14 }} />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
