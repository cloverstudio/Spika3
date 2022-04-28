import React, { useEffect } from "react";
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
    FavoriteBorder,
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
    onClose: Function;
    anchorElement?: HTMLDivElement;
    showMessageDetails: Function;
    messageId: number;
}

export function MessageDetailOptions(props: MessageDetailsOptionsProps) {
    const { open, onClose, anchorElement, showMessageDetails, messageId } = props;
    const id = open ? "simple-popover" : undefined;

    const handleClose = () => {
        onClose();
    };
    const showModalMessageDetails = () => {
        showMessageDetails(messageId);
        onClose();
    };

    return (
        <Popover
            id={id}
            open={open}
            anchorEl={anchorElement}
            onClose={handleClose}
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
                    onClick={(e) => {
                        handleClose();
                    }}
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
                        <Reply />
                        <Typography variant="subtitle1">Reply</Typography>
                    </Stack>
                </IconButton>
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
                    onClick={(e) => {
                        handleClose();
                    }}
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
                        <Shortcut />
                        <Typography variant="subtitle1">Forward message</Typography>
                    </Stack>
                </IconButton>
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
                    onClick={(e) => {
                        handleClose();
                    }}
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
                        <ContentCopy />
                        <Typography variant="subtitle1">Copy</Typography>
                    </Stack>
                </IconButton>
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
                    onClick={(e) => {
                        showModalMessageDetails();
                        handleClose();
                    }}
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
                        <InfoOutlined />
                        <Typography variant="subtitle1">Details</Typography>
                    </Stack>
                </IconButton>
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
                    onClick={(e) => {
                        handleClose();
                    }}
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
                        <FavoriteBorder />
                        <Typography variant="subtitle1">Add to favorite</Typography>
                    </Stack>
                </IconButton>
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
                    onClick={(e) => {
                        handleClose();
                    }}
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
                        <DeleteOutline style={{ fill: "red" }} />
                        <Typography variant="subtitle1" color="red">
                            Delete
                        </Typography>
                    </Stack>
                </IconButton>
            </Stack>
        </Popover>
    );
}

export interface MessageDetailsDialogProps {
    open: boolean;
    onClose: Function;
    messageId: number;
}

export function MessageDetailDialog(props: MessageDetailsDialogProps) {
    const { onClose, open } = props;
    const [seenMembers, setSeenMembers] = React.useState<Array<MessageRecordType>>(null);
    const [delveredMembers, setDeliveredMembers] = React.useState<Array<MessageRecordType>>(null);
    const handleClose = () => {
        onClose();
    };
    const me = useSelector(selectUser);
    const { data, isLoading } = useGetMessageRecordsByIdQuery(props.messageId);
    const filterUsers = () => {
        if (data == null) return;
        console.log(JSON.stringify(data));
        const seen = data.messageRecords.filter(
            (record) => record.type === "seen" && record.userId != me.id
        );
        setSeenMembers(seen);
        const allDelivered = data.messageRecords.filter(
            (record) => record.type !== "seen" && record.userId != me.id
        );
        var filteredDelivered: MessageRecordType[] = [];
        seen.forEach((record) =>
            allDelivered.forEach((secondRecord) => {
                if (record.userId != secondRecord.userId) {
                    filteredDelivered.push(secondRecord);
                }
            })
        );
        setDeliveredMembers(filteredDelivered);
    };

    useEffect(() => {
        filterUsers();
    }, [data]);

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle sx={{ textAlign: "center" }}>Details</DialogTitle>
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    // width: "100%",
                    margin: "0",
                    padding: "5px",
                    position: "absolute",
                    right: "10px",
                    top: "12px",
                }}
                onClick={(e) => {
                    handleClose();
                }}
            >
                <Close />
            </IconButton>
            <Box sx={{ width: "300px" }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "90%",
                        margin: "10px",
                    }}
                >
                    <Typography variant="h6">Read by</Typography>
                    <DoneAll fontSize="large" color="info" />
                </Stack>
                <List sx={{ pt: 0 }}>
                    {seenMembers
                        ? seenMembers.map((member) => (
                              <MessageDetailRow record={member} key={member.id} />
                          ))
                        : null}
                </List>
            </Box>
            <Box sx={{ width: "300px" }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "90%",
                        margin: "10px",
                    }}
                >
                    <Typography variant="h6">Delivered to</Typography>
                    <DoneAll fontSize="large" />
                </Stack>
                <List sx={{ pt: 0 }}>
                    {delveredMembers
                        ? delveredMembers.map((member) => (
                              <MessageDetailRow record={member} key={member.id} />
                          ))
                        : null}
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
    console.log("Data: " + JSON.stringify(data));
    return (
        <ListItem key={record.id}>
            {data ? (
                <Box>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "90%",
                            margin: "10px",
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar src={`${UPLOADS_BASE_URL}${data.user.avatarUrl}`}></Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={data.user.displayName}
                            secondary={dayjs(record.createdAt).fromNow()}
                        />
                    </Stack>
                </Box>
            ) : (
                <Box>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "90%",
                            margin: "10px",
                        }}
                    >
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="text" animation="wave" width={100} height={20} />
                    </Stack>
                </Box>
            )}
        </ListItem>
    );
}
