import React from "react";
import { useDispatch } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import Call from "@mui/icons-material/Call";
import Search from "@mui/icons-material/Search";
import Videocam from "@mui/icons-material/Videocam";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import Avatar from "@mui/material/Avatar";
import { Box } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useGetRoomQuery } from "../api/room";
import { showLeftSidebar } from "../slices/leftSidebar";
import { toggleRightSidebar } from "../slices/rightSidebar";
import { RoomType } from "../../../types/Rooms";

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
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();

    const iconSxProps = { width: "25px", height: "25px", color: "primary.main", cursor: "pointer" };
    const lobbyBaseUrl = `/rooms/${room.id}/call/lobby`;

    return (
        <>
            <Box display="flex" alignItems="center">
                {isMobile && (
                    <ChevronLeft
                        sx={{
                            ...iconSxProps,
                            mr: 0.5,
                        }}
                        onClick={() => dispatch(showLeftSidebar())}
                    />
                )}
                <Avatar alt={room?.name} src={`${UPLOADS_BASE_URL}/${room.avatarFileId}`} />

                <Typography
                    fontWeight="500"
                    ml={1.5}
                    sx={{ cursor: "pointer" }}
                    onClick={() => dispatch(toggleRightSidebar())}
                >
                    {room.name}
                </Typography>
            </Box>
            <Box display="flex" gap={3} alignItems="center">
                <Videocam
                    sx={iconSxProps}
                    onClick={() => navigate(`${lobbyBaseUrl}/video`, { replace: true })}
                />
                <Call
                    sx={iconSxProps}
                    onClick={() => navigate(`${lobbyBaseUrl}/audio`, { replace: true })}
                />
                <Search sx={iconSxProps} />
            </Box>
        </>
    );
}

function HeaderContentSkeleton() {
    return <Skeleton width="100%" />;
}
