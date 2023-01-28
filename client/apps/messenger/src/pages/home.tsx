import React, { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Box } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";

import Base from "../components/Base";
import PushNotificationPermissionDialog from "../components/PushnotificationPermissionDialog";
import LeftSidebar from "../features/room/LeftSidebar";
import RightSidebar from "../features/room/RightSidebar";
import { selectLeftSidebarOpen, setLeftSidebar } from "../features/room/slices/leftSidebar";

import {
    hideRightSidebar,
    selectRightSidebarOpen,
    showRightSidebar,
} from "../features/room/slices/rightSidebar";

import { selectUserId, fetchMe, fetchSettings } from "../../src/store/userSlice";

export default function Home(): React.ReactElement {
    const theme = useTheme();
    const { pathname } = useLocation();
    const roomId = +useParams().id;

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isBigDesktop = useMediaQuery(theme.breakpoints.up("lg"));
    const dispatch = useDispatch();
    const open = useSelector(selectLeftSidebarOpen);
    const isCall = /^.+\/call.*$/.test(pathname);

    const rightSidebarOpen =
        (useSelector(selectRightSidebarOpen) || isBigDesktop) && !isCall && roomId;

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
        if (!loggedInUserId) {
            dispatch(fetchMe());
            dispatch(fetchSettings());
        }
    }, []);

    useEffect(() => {
        if (isMobile) {
            dispatch(setLeftSidebar(true));
        }
    }, [isMobile, dispatch]);

    const setOpen = () => dispatch(setLeftSidebar(!open));
    return (
        <Base>
            <Box
                display="grid"
                sx={{
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: rightSidebarOpen ? "360px 4fr 360px" : "360px 2fr",
                        xl: rightSidebarOpen ? "360px 3fr 640px" : "360px 4fr",
                    },
                }}
            >
                {isMobile ? (
                    <Drawer
                        anchor="left"
                        open={open}
                        onClose={() => setOpen()}
                        hideBackdrop={false}
                    >
                        <LeftSidebar />
                    </Drawer>
                ) : (
                    <LeftSidebar />
                )}
                <Outlet />

                {rightSidebarOpen ? <RightSidebar /> : null}
            </Box>

            <PushNotificationPermissionDialog />
        </Base>
    );
}
