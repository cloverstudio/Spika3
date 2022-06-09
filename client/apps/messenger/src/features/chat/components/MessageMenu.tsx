import React from "react";
import { useSelector } from "react-redux";
import {
    Avatar,
    Box,
    Typography,
    Popover,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Skeleton,
} from "@mui/material";
import {
    Reply,
    Shortcut,
    ContentCopy,
    Edit,
    DeleteOutline,
    InfoOutlined,
    Close,
    DoneAll,
} from "@mui/icons-material";

import { MessageRecordType } from "../../../types/Message";
import { selectUser } from "../../../store/userSlice";
import { useGetMessageRecordsByIdQuery } from "../api/message";
import { useGetUserByIdQuery } from "../api/user";

import dayjs from "dayjs";

declare const UPLOADS_BASE_URL: string;

export interface MessageDetailsOptionsProps {
    open: boolean;
    onClose: () => void;
    anchorElement?: HTMLDivElement;
    showMessageDetails: () => void;
    onDelete: () => void;
    onEdit: () => void;
}

export function MessageMenu(props: MessageDetailsOptionsProps) {
    const { open, onClose, anchorElement, showMessageDetails, onDelete, onEdit } = props;

    const showModalMessageDetails = () => {
        showMessageDetails();
        onClose();
    };

    const showDeleteModal = () => {
        onDelete();
        onClose();
    };

    const showEditModal = () => {
        onEdit();
        onClose();
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorElement}
            onClose={onClose}
            anchorOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
        >
            <Stack
                direction="column"
                alignItems="center"
                spacing={0}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "left",

                    padding: "10px",
                }}
            >
                {/*  <MessageOption onClick={onClose} label="Reply" icon={<Reply />} />
                <MessageOption onClick={onClose} label="Forward message" icon={<Shortcut />} />
                <MessageOption onClick={onClose} label="Copy" icon={<ContentCopy />} />
                <MessageOption
                    onClick={onClose}
                    label="Add to favorite"
                    icon={<FavoriteBorder />}
                /> */}
                {onEdit && <MessageOption onClick={showEditModal} label="Edit" icon={<Edit />} />}
                <MessageOption
                    onClick={showModalMessageDetails}
                    label="Details"
                    icon={<InfoOutlined />}
                />
                {onDelete && (
                    <MessageOption
                        onClick={showDeleteModal}
                        label="Delete"
                        icon={<DeleteOutline style={{ fill: "red" }} />}
                    />
                )}
            </Stack>
        </Popover>
    );
}

type MessageOptionProps = {
    onClick: () => void;
    icon: React.ReactElement;
    label: string;
};

function MessageOption({ onClick, icon, label }: MessageOptionProps) {
    return (
        <IconButton
            disableRipple
            size="large"
            sx={{
                ml: 1,
                "&.MuiButtonBase-root:hover": {
                    bgcolor: "transparent",
                },
                width: "100%",
                margin: "0",
                padding: "5px",
            }}
            onClick={onClick}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    width: "100%",
                }}
            >
                {icon}
                <Typography variant="subtitle1">{label}</Typography>
            </Stack>
        </IconButton>
    );
}

export interface MessageDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    messageId: number;
}

export function MessageDetailDialog(props: MessageDetailsDialogProps) {
    const { onClose, open, messageId } = props;
    const me = useSelector(selectUser);
    const { data } = useGetMessageRecordsByIdQuery(messageId);

    const messageRecords = data?.messageRecords || [];
    const seenMembers = messageRecords.filter((mr) => mr.type === "seen" && mr.userId !== me.id);
    const deliveredMembers = messageRecords.filter(
        (mr) => mr.type === "delivered" && mr.userId !== me.id
    );

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle sx={{ textAlign: "center" }}>Details</DialogTitle>
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
            <Box width="250px" m="1rem">
                <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" mb={4}>
                        Read by
                    </Typography>
                    <DoneAll fontSize="large" color="info" />
                </Box>
                <List sx={{ pt: 0 }}>
                    {seenMembers.map((member) => (
                        <MessageDetailRow record={member} key={member.id} />
                    ))}
                </List>
            </Box>
            <Box width="250px" m="1rem">
                <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" mb={4}>
                        Delivered to
                    </Typography>
                    <DoneAll fontSize="large" />
                </Box>

                <List sx={{ pt: 0 }}>
                    {deliveredMembers.map((member) => (
                        <MessageDetailRow record={member} key={member.id} />
                    ))}
                </List>
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
                <Box display="flex" justifyContent="space-between">
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
