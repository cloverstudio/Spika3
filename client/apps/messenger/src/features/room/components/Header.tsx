import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import CallIcon from "@mui/icons-material/Call";
import VideoCamIcon from "@mui/icons-material/Videocam";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import Avatar from "@mui/material/Avatar";
import { Box, IconButton } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useGetRoomBlockedQuery, useGetRoomQuery, useStartMeetMutation } from "../api/room";
import {
    selectRightSidebarOpen,
    setActiveTab,
    showNoteEditModal,
    toggleRightSidebar,
} from "../slices/rightSidebar";
import { RoomType } from "../../../types/Rooms";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { openStartMeetDialog } from "../slices/startMeetDialog";
import { shouldshowMeetIframe } from "../slices/meetIframe";
import { selectRoomMessages } from "../slices/messages";
import { SYSTEM_MESSAGE_TYPE_INITIATE_CALL } from "../lib/consts";

export default function Header() {
    const roomId = parseInt(useParams().id || "");

    const { data: room, isLoading } = useGetRoomQuery(roomId);
    const { data: roomBlock } = useGetRoomBlockedQuery(roomId);

    return (
        <Box px={2} borderBottom="0.5px solid" sx={{ borderColor: "divider" }}>
            <Box display="flex" justifyContent="space-between" height="80px">
                {isLoading && <HeaderContentSkeleton />}
                {room && <HeaderContent room={room} roomBlock={roomBlock} />}
            </Box>
        </Box>
    );
}

function HeaderContent({ room, roomBlock }: { room: RoomType; roomBlock: { id: number } }) {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isRightSidebarOpen = useSelector(selectRightSidebarOpen);
    const isMeetIframeOpen = useSelector(shouldshowMeetIframe);
    const messages = useSelector(selectRoomMessages(room.id));
    const [startMeet] = useStartMeetMutation();

    const isSomeNoteEditing =
        useAppSelector((state) => state.rightSidebar.activeTab) === "editNote";

    const showCallButtons = useMemo(() => {
        if (messages) {
            const isGroup = room.type === "group";
            let hasOngoingCall = false;
            if (isGroup) {
                const messagesMap = new Map(Object.entries(messages));
                hasOngoingCall = Array.from(messagesMap.values()).some(
                    (message) =>
                        message.body?.type === SYSTEM_MESSAGE_TYPE_INITIATE_CALL &&
                        message.body?.isOngoing === true,
                );
            }
            return !roomBlock && !isMeetIframeOpen && !hasOngoingCall;
        }
    }, [roomBlock, isMeetIframeOpen, messages]);

    const iconSxProps = {
        width: "25px",
        height: "25px",
        color: "primary.main",
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "transparent",
        },
    };

    const moreOptionsClickHandler = () => {
        if (isSomeNoteEditing) {
            dispatch(showNoteEditModal());
            return;
        }
        dispatch(toggleRightSidebar());
    };

    const handleStartMeet = async (enableCamera: boolean) => {
        try {
            await startMeet({ roomId: room.id }).unwrap();
            dispatch(
                openStartMeetDialog({
                    roomId: room.id,
                    avatarFileId: room.avatarFileId,
                    displayName: room.name,
                    enableCamera,
                }),
            );
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Box display="flex" alignItems="center">
                {isMobile && <MobileBackButton />}
                <Avatar
                    alt={room?.name}
                    src={`${UPLOADS_BASE_URL}/${room.avatarFileId}`}
                    onClick={() => {
                        if (isMobile) return;
                        moreOptionsClickHandler();
                    }}
                    sx={{ cursor: isMobile ? "default" : "pointer" }}
                />

                <Typography
                    fontWeight="500"
                    ml={1.5}
                    sx={{ cursor: "pointer" }}
                    onClick={moreOptionsClickHandler}
                >
                    {room.name}
                </Typography>
            </Box>
            <Box display="flex" gap={3} alignItems="center">
                {showCallButtons && (
                    <>
                        <IconButton sx={iconSxProps} onClick={() => handleStartMeet(false)}>
                            <CallIcon />
                        </IconButton>
                        <IconButton sx={iconSxProps} onClick={() => handleStartMeet(true)}>
                            <VideoCamIcon />
                        </IconButton>
                    </>
                )}
                <IconButton
                    sx={iconSxProps}
                    onClick={() => {
                        dispatch(setActiveTab("search"));
                        if (!isRightSidebarOpen) dispatch(toggleRightSidebar());
                    }}
                >
                    <SearchIcon />
                </IconButton>
                <IconButton sx={iconSxProps} onClick={moreOptionsClickHandler}>
                    <MoreVertIcon />
                </IconButton>
            </Box>
        </>
    );
}

function MobileBackButton() {
    const iconSxProps = { width: "25px", height: "25px", color: "primary.main", cursor: "pointer" };

    return (
        <Link
            to="/app"
            style={{ textDecoration: "none", display: "grid", justifyContent: "center" }}
        >
            <ChevronLeft
                sx={{
                    ...iconSxProps,
                    mr: 0.5,
                }}
            />
        </Link>
    );
}

function HeaderContentSkeleton() {
    return <Skeleton width="100%" />;
}
