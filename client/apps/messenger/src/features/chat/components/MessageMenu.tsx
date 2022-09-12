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
    DoneOutlineSharp,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

import MessageType, { MessageRecordType } from "../../../types/Message";
import { selectUser } from "../../../store/userSlice";
import { useGetMessageRecordsByIdQuery } from "../api/message";
import { useGetUserByIdQuery } from "../api/user";

import dayjs from "dayjs";
import { utils } from "mocha";
import * as Utils from "../../../../../../lib/utils";

declare const UPLOADS_BASE_URL: string;

export interface MessageDetailsOptionsProps {
    open: boolean;
    onClose: () => void;
    anchorElement?: HTMLDivElement;
    showMessageDetails: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
}

export function MessageMenu(props: MessageDetailsOptionsProps) {
    const { open, onClose, anchorElement, showMessageDetails, onDelete, onEdit } = props;

    const showModalMessageDetails = () => {
        showMessageDetails();
        onClose();
    };

    const showDeleteModal = () => {
        if (onDelete) {
            onDelete();
            onClose();
        }
    };

    const showEditModal = () => {
        if (onEdit) {
            onEdit();
            onClose();
        }
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
            <Box
                sx={{
                    padding: "2px",
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
            </Box>
        </Popover>
    );
}

type MessageOptionProps = {
    onClick: () => void;
    icon: React.ReactElement;
    label: string;
};

function MessageOption({ onClick, icon, label }: MessageOptionProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                padding: "10px 30px 10px 5px",
                display: "flex",
                flexDirectio: "row",
                alignItems: "center",
                height: "2.5rem",
                cursor: "pointer",
                "&:hover": {
                    background: theme.palette.action.hover,
                },
            }}
            onClick={onClick}
        >
            <Box sx={{ marginRight: "15px" }}>{icon}</Box>

            {label}
        </Box>
    );
}

export interface MessageDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    messageId: number;
    message: MessageType;
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
                    Message sent at {Utils.showDetailDate(props.message.createdAt)}
                </Box>
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
