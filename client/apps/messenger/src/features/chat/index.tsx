import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Avatar,
    Box,
    Input,
    Typography,
    useMediaQuery,
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
    Call,
    Search,
    Videocam,
    Reply,
    Shortcut,
    ContentCopy,
    FavoriteBorder,
    DeleteOutline,
    InfoOutlined,
    Close,
    DoneAll,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { useGetRoomQuery } from "./api/room";
import {
    useGetMessagesByRoomIdQuery,
    useMarkRoomMessagesAsSeenMutation,
    useSendMessageMutation,
    useGetMessageRecordsByIdQuery,
} from "./api/message";

import { useGetUserByIdQuery } from "./api/user";

import { selectRoomMessages, setActiveRoomId } from "./slice/chatSlice";
import { selectUser } from "../../store/userSlice";
import rightSidebarSlice, {
    show as showRightSidebar,
    hide as hideRightSidebar,
} from "./slice/rightSidebarSlice";

import Loader from "../../components/Loader";

import formatRoomInfo from "./lib/formatRoomInfo";
import useIsInViewport from "../../hooks/useIsInViewport";
import { setLeftSidebar } from "./slice/sidebarSlice";
import MessageStatusIcon from "./components/MessageStatusIcon";
import { RootState } from "../../store/store";
import { MessageRecordType } from "../../types/Message";

export default function Chat(): React.ReactElement {
    const roomId = +useParams().id;
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const [sendMessage] = useSendMessageMutation();
    const { data, isLoading } = useGetRoomQuery(roomId);
    const [markRoomMessagesAsSeen] = useMarkRoomMessagesAsSeenMutation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { messages } = useSelector(selectRoomMessages(roomId));

    const room = data?.room;

    const onSend = (message: string) => {
        sendMessage({ message: { text: message }, roomId: room.id, type: "text" });
    };

    useEffect(() => {
        dispatch(setActiveRoomId(roomId));

        return () => {
            dispatch(setActiveRoomId(null));
        };
    }, [dispatch, roomId]);

    useEffect(() => {
        markRoomMessagesAsSeen(roomId);
    }, [dispatch, roomId, markRoomMessagesAsSeen, messages.length]);

    if (isLoading) {
        return <Loader />;
    }

    if (!room) {
        return null;
    }

    const mobileProps = {
        position: "absolute" as const,
        bottom: "0",
        top: "0",
        left: "0",
        right: "0",
    };

    const desktopProps = {
        height: "100vh",
    };

    return (
        <Box display="flex" flexDirection="column" sx={isMobile ? mobileProps : desktopProps}>
            <ChatHeader {...formatRoomInfo(room, user.id)} />
            <ChatMessages roomId={roomId} />
            <ChatInput handleSend={onSend} />
        </Box>
    );
}

type ChatHeaderProps = {
    name: string;
    avatarUrl: string;
};

function ChatHeader({ name, avatarUrl }: ChatHeaderProps): React.ReactElement {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const dispatch = useDispatch();
    const rightSidebarState = useSelector((state: RootState) => state.rightSidebar);

    return (
        <Box px={2} borderBottom="0.5px solid #C9C9CA">
            <Box display="flex" justifyContent="space-between" height="80px">
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{ cursor: "pointer" }}
                    onClick={(e) => {
                        if (!rightSidebarState.isOpened) dispatch(showRightSidebar());
                        else dispatch(hideRightSidebar());
                    }}
                >
                    {isMobile && (
                        <ChevronLeftIcon
                            sx={{ mr: 0.5 }}
                            onClick={() => dispatch(setLeftSidebar(true))}
                            fontSize="large"
                        />
                    )}
                    <Avatar alt={name} src={avatarUrl} />

                    <Typography fontWeight="500" fontSize="1rem" ml={1.5}>
                        {name}
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <Box mr={3}>
                        <Videocam
                            sx={{
                                fontSize: "28px",
                                color: "#4696F0",
                                cursor: "pointer",
                            }}
                        />
                    </Box>
                    <Box mr={3}>
                        <Call
                            sx={{
                                fontSize: "28px",
                                color: "#4696F0",
                                cursor: "pointer",
                            }}
                        />
                    </Box>
                    <Box>
                        <Search
                            sx={{
                                fontSize: "28px",
                                color: "#4696F0",
                                cursor: "pointer",
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

type ChatMessagesProps = {
    roomId: number;
};

function ChatMessages({ roomId }: ChatMessagesProps): React.ReactElement {
    const user = useSelector(selectUser);
    const ref = useRef<HTMLBaseElement>();
    const { messages, count } = useSelector(selectRoomMessages(roomId));
    const [page, setPage] = useState(1);
    const [scrollTop, setScrollTop] = useState(null);
    const [scrollListenerSet, setScrollListener] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const { isFetching } = useGetMessagesByRoomIdQuery({ roomId, page });
    const hasMoreContactsToLoad = count > messages.length;

    const { isInViewPort, elementRef } = useIsInViewport();

    const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const showModalMessageDetails = (messageId: number) => {
        setOpenMessageDetails(true);
        setMessageId(messageId);
    };
    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    const [openMessageDetails, setOpenMessageDetails] = React.useState(false);
    const [selectedMessageId, setMessageId] = React.useState(null);

    const handleCloseMessageDetails = (value: string) => {
        setOpenMessageDetails(false);
    };

    useEffect(() => {
        if (scrollListenerSet && isInViewPort && !isFetching && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
            if (shouldAutoScroll) {
                const elem = ref.current;
                elem.scroll({
                    top: elem.scrollHeight,
                });
            }
        }
    }, [isInViewPort, isFetching, hasMoreContactsToLoad, scrollListenerSet, shouldAutoScroll]);

    useEffect(() => {
        const handleScroll = (e: HTMLBaseElement) => {
            setScrollTop((scrollTop: any) => {
                if (e.scrollTop < scrollTop) {
                    setShouldAutoScroll(false);
                }

                if (e.offsetHeight + e.scrollTop === e.scrollHeight) {
                    setShouldAutoScroll(true);
                }

                return e.scrollTop;
            });
        };

        if (ref && ref.current && !scrollListenerSet) {
            const elem = ref.current;

            elem.addEventListener("scroll", () => handleScroll(elem));
            setScrollListener(true);
            return () => {
                elem.removeEventListener("scroll", () => handleScroll(elem));
            };
        }
    }, [scrollTop, scrollListenerSet]);

    useEffect(() => {
        const elem = ref.current;
        if (messages.length && shouldAutoScroll && scrollListenerSet && ref && ref.current) {
            elem.scroll({
                top: elem.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages.length, shouldAutoScroll, scrollListenerSet]);

    useEffect(() => {
        return () => {
            setPage(1);
        };
    }, [roomId]);

    return (
        <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="end"
            sx={{ overflowY: "hidden" }}
        >
            <Box px={4} sx={{ overflowY: "auto" }} ref={ref}>
                <div ref={elementRef} />
                {messages
                    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
                    .map((m) => {
                        const isUsersMessage = user?.id === m.fromUserId;

                        const getStatusIcon = () => {
                            if (m.seenCount === m.totalUserCount) {
                                return "seen";
                            }

                            if (m.deliveredCount === m.totalUserCount) {
                                return "delivered";
                            }

                            return "sent";
                        };
                        return (
                            <Box
                                key={m.id}
                                display="flex"
                                flexDirection="column"
                                alignItems={isUsersMessage ? "end" : "start"}
                                textAlign={isUsersMessage ? "right" : "left"}
                            >
                                <div
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        handleClick(e);
                                    }}
                                >
                                    <Box
                                        maxWidth="35rem"
                                        bgcolor={isUsersMessage ? "#C8EBFE" : "#F2F2F2"}
                                        borderRadius="0.625rem"
                                        p="0.625rem"
                                        pb="0.8125"
                                        mb="0.375rem"
                                    >
                                        <Typography
                                            fontWeight={500}
                                            fontSize="0.875rem"
                                            color="#131940"
                                            lineHeight="1,0625rem"
                                        >
                                            {m.body.text}
                                        </Typography>
                                    </Box>
                                    <Popover
                                        id={id}
                                        open={open}
                                        anchorEl={anchorEl}
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
                                                    <Typography variant="subtitle1">
                                                        Reply
                                                    </Typography>
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
                                                    <Typography variant="subtitle1">
                                                        Forward message
                                                    </Typography>
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
                                                    <Typography variant="subtitle1">
                                                        Copy
                                                    </Typography>
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
                                                    showModalMessageDetails(m.id);
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
                                                    <Typography variant="subtitle1">
                                                        Details
                                                    </Typography>
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
                                                    <Typography variant="subtitle1">
                                                        Add to favorite
                                                    </Typography>
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
                                </div>
                                {isUsersMessage && <MessageStatusIcon status={getStatusIcon()} />}
                            </Box>
                        );
                    })}
            </Box>
            {openMessageDetails ? (
                <MessageDetailDialog
                    open={openMessageDetails}
                    onClose={handleCloseMessageDetails}
                    messageId={selectedMessageId}
                />
            ) : null}
        </Box>
    );
}

type ChatInputProps = {
    handleSend: (message: string) => void;
};

function ChatInput({ handleSend }: ChatInputProps): React.ReactElement {
    const [message, setMessage] = useState("");

    return (
        <Box
            minHeight="80px"
            borderTop="0.5px solid #C9C9CA"
            display="flex"
            alignItems="center"
            px={2}
        >
            <Input
                disableUnderline={true}
                fullWidth
                value={message}
                onChange={({ target }) => setMessage(target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSend(message);
                        setMessage("");
                    }
                }}
                placeholder="Type here..."
                sx={{
                    backgroundColor: "#fff",
                    border: "1px solid #C9C9CA",
                    input: {
                        py: 2,
                        px: 1.5,
                    },
                }}
            />
        </Box>
    );
}

export interface MessageDetailsDialogProps {
    open: boolean;
    onClose: Function;
    messageId: number;
}

function MessageDetailDialog(props: MessageDetailsDialogProps) {
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
                        ? seenMembers.map((member) => <MessageDetailRow record={member} />)
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
                        ? delveredMembers.map((member) => <MessageDetailRow record={member} />)
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
    console.log("Tu udje");
    console.log("User: " + JSON.stringify(record));
    const { data, isLoading } = useGetUserByIdQuery(record.userId);
    return (
        <ListItem key={record.id}>
            {data ? (
                <Box>
                    <ListItemAvatar>
                        <Avatar></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={record.id} />
                </Box>
            ) : (
                <Box>
                    {" "}
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
