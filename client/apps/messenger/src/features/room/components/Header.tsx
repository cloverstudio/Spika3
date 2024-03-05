import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import Avatar from "@mui/material/Avatar";
import { Box } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useGetRoomQuery } from "../api/room";
import {
    selectRightSidebarOpen,
    setActiveTab,
    showNoteEditModal,
    toggleRightSidebar,
} from "../slices/rightSidebar";
import { RoomType } from "../../../types/Rooms";
import { useAppDispatch, useAppSelector } from "../../../hooks";

export default function Header() {
    const roomId = parseInt(useParams().id || "");

    const { data: room, isLoading } = useGetRoomQuery(roomId);

    return (
        <Box px={2} borderBottom="0.5px solid" sx={{ borderColor: "divider" }}>
            <Box display="flex" justifyContent="space-between" height="80px">
                {isLoading && <HeaderContentSkeleton />}
                {room && <HeaderContent room={room} />}
            </Box>
        </Box>
    );
}

function HeaderContent({ room }: { room: RoomType }) {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isRightSidebarOpen = useSelector(selectRightSidebarOpen);

    const isSomeNoteEditing =
        useAppSelector((state) => state.rightSidebar.activeTab) === "editNote";

    const iconSxProps = { width: "25px", height: "25px", color: "primary.main", cursor: "pointer" };

    const moreOptionsClickHandler = () => {
        if (isSomeNoteEditing) {
            dispatch(showNoteEditModal());
            return;
        }
        dispatch(toggleRightSidebar());
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
                <SearchIcon
                    sx={iconSxProps}
                    onClick={() => {
                        dispatch(setActiveTab("search"));
                        if (!isRightSidebarOpen) dispatch(toggleRightSidebar());
                    }}
                />
                <MoreVertIcon sx={iconSxProps} onClick={moreOptionsClickHandler}></MoreVertIcon>
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
