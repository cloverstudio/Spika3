import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Box, Typography, useMediaQuery } from "@mui/material";
import { Call, Search, Videocam } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { selectUser } from "../../../store/userSlice";
import { show as showRightSidebar, hide as hideRightSidebar } from "../slice/rightSidebarSlice";

import { setLeftSidebar } from "../slice/sidebarSlice";

declare const UPLOADS_BASE_URL: string;
import { RootState } from "../../../store/store";

import Confcall from "../../confcall";

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
    const [showConfcall, setShowConfcall] = useState<boolean>(false);
    const me = useSelector(selectUser);

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
                            sx={{
                                width: "25px",
                                height: "25px",
                                mr: 0.5,
                            }}
                            onClick={() => dispatch(setLeftSidebar(true))}
                        />
                    )}
                    <Avatar alt={name} src={`${UPLOADS_BASE_URL}${avatarUrl}`} />

                    <Typography fontWeight="500" ml={1.5}>
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
                                setShowConfcall(true);
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
                                setShowConfcall(true);
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

            {showConfcall ? (
                <>
                    <Confcall
                        roomId={`${roomId}`}
                        userId={`${me.id}`}
                        userName={me.displayName}
                        onClose={() => {
                            setShowConfcall(false);
                        }}
                    />
                </>
            ) : null}
        </Box>
    );
}
