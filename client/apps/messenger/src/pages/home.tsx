import React, { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Box, Fade } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";

import Base from "../components/Base";
import PushNotificationPermissionDialog from "../components/PushnotificationPermissionDialog";
import LeftSidebar from "../features/room/LeftSidebar";
import RightSidebar from "../features/room/RightSidebar";

import {
    hideRightSidebar,
    selectRightSidebarActiveNoteId,
    selectRightSidebarOpen,
    showRightSidebar,
} from "../features/room/slices/rightSidebar";

import { selectUserId, fetchMe, fetchSettings } from "../../src/store/userSlice";
import * as constants from "../../../../lib/constants";
import TitleUpdater from "../features/room/components/TitleUpdater";

export default function Home(): React.ReactElement {
    const theme = useTheme();
    const { pathname } = useLocation();
    const roomId = +useParams().id;

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const dispatch = useDispatch();
    const isCall = /^.+\/call.*$/.test(pathname);
    const isHome = pathname === "/app" || pathname === "/app/";

    const rightSidebarOpen = useSelector(selectRightSidebarOpen) && !isCall && !!roomId;
    const activeSidebarNoteId = useSelector(selectRightSidebarActiveNoteId);

    useEffect(() => {
        const resizeEventListener = (e: UIEvent) => {
            if ((e.currentTarget as Window).innerWidth > theme.breakpoints.values.lg) {
                if (!rightSidebarOpen) {
                    dispatch(showRightSidebar());
                }
            } else {
                if (rightSidebarOpen) {
                    dispatch(hideRightSidebar());
                }
            }
        };

        window.addEventListener("resize", resizeEventListener);

        return () => {
            window.removeEventListener("resize", resizeEventListener);
        };
    }, [rightSidebarOpen, dispatch, theme.breakpoints.values.lg]);

    const loggedInUserId = useSelector(selectUserId);

    useEffect(() => {
        if (!loggedInUserId && window.localStorage.getItem(constants.LSKEY_ACCESSTOKEN)) {
            dispatch(fetchMe());
            dispatch(fetchSettings());
        }
    }, [dispatch, loggedInUserId]);

    if (isHome && isMobile) {
        return (
            <Base>
                <LeftSidebar />
            </Base>
        );
    }
    return (
        <Base>
            <Box
                display="grid"
                sx={{
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: rightSidebarOpen
                            ? `500px 4fr ${activeSidebarNoteId ? "420px" : "340px"}`
                            : "500px 2fr 0px",
                        xl: rightSidebarOpen
                            ? `500px 3fr ${activeSidebarNoteId ? "640px" : "420px"}`
                            : "500px 4fr 0px",
                    },
                    transition: "grid-template-columns 0.2s ease-in",
                }}
            >
                {!isMobile && <LeftSidebar />}
                <Outlet />

                <Fade in={rightSidebarOpen} timeout={500} mountOnEnter unmountOnExit>
                    <Box>
                        <RightSidebar />
                    </Box>
                </Fade>
            </Box>

            <PushNotificationPermissionDialog />
            <TitleUpdater />
        </Base>
    );
}
