import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, Typography, useMediaQuery } from "@mui/material";
import { Call, Search, Videocam } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { show as showRightSidebar, hide as hideRightSidebar } from "../slice/rightSidebarSlice";

import { setLeftSidebar } from "../slice/sidebarSlice";

declare const UPLOADS_BASE_URL: string;
import { RootState } from "../../../store/store";

type RoomHeaderProps = {
    name: string;
    avatarUrl: string;
    roomId: number;
};

export default function RoomHeader({
    name,
    avatarUrl,
    roomId,
}: RoomHeaderProps): React.ReactElement {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const dispatch = useDispatch();
    const rightSidebarState = useSelector((state: RootState) => state.rightSidebar);
    const navigate = useNavigate();

    useEffect(() => {
        if (name) {
            window.document.title = name;
        }
    }, [name]);

    return (
        <Box px={2} borderBottom="0.5px solid #C9C9CA">
            <Box display="flex" justifyContent="space-between" height="80px">
                <Box
                    display="flex"
                    alignItems="center"
                >
                    {isMobile && (
                        <ChevronLeftIcon
                            sx={{
                                width: "25px",
                                height: "25px",
                                mr: 0.5,
                            }}
                            onClick={() => dispatch(setLeftSidebar(true))}
                        />
                    )}
                    <Avatar alt={name} src={`${UPLOADS_BASE_URL}${avatarUrl}`} />

                    <Typography 
                        fontWeight="500" ml={1.5}                     
                        sx={{ cursor: "pointer" }}
                        onClick={(e) => {
                        if (!rightSidebarState.isOpened) dispatch(showRightSidebar());
                        else dispatch(hideRightSidebar());
                    }}>
                        {name}
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <Box mr={3}>
                        <Videocam
                            sx={{
                                width: "25px",
                                height: "25px",
                                color: "primary.main",
                                cursor: "pointer",
                            }}
                            onClick={(e) => {
                                navigate(`/rooms/${roomId}/call/lobby/video`, { replace: true });
                            }}
                        />
                    </Box>
                    <Box mr={3}>
                        <Call
                            sx={{
                                width: "25px",
                                height: "25px",
                                color: "primary.main",
                                cursor: "pointer",
                            }}
                            onClick={(e) => {
                                navigate(`/rooms/${roomId}/call/lobby/audio`, { replace: true });
                            }}
                        />
                    </Box>
                    <Box>
                        <Search
                            sx={{
                                width: "25px",
                                height: "25px",
                                color: "primary.main",
                                cursor: "pointer",
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
