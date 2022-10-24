import React, { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Base from "../components/Base";
import PushnotificationPermissionDialog from "../components/PushnotificationPermissionDialog";
import LeftSidebar from "../features/chat/LeftSidebar";
import RightSidebar from "../features/chat/RightSidebar";
import { selectLeftSidebarOpen, setLeftSidebar } from "../features/chat/slice/sidebarSlice";

import { hide, selectRightSidebarOpen, show } from "../features/chat/slice/rightSidebarSlice";

import { selectUserId, fetchMe, fetchSettings } from "../../src/store/userSlice";

export default function Home(): React.ReactElement {
    const theme = useTheme();
    const { pathname } = useLocation();
    const roomId = +useParams().id;

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isBigDesktop = useMediaQuery(theme.breakpoints.up("lg"));
    const dispatch = useDispatch();
    const open = useSelector(selectLeftSidebarOpen);
    const rightSidebarOpen =
        ((useSelector(selectRightSidebarOpen) && !pathname.includes("/call")) || isBigDesktop) &&
        roomId;

    useEffect(() => {
        const resizeEventListener = (e: UIEvent) => {
            if ((e.currentTarget as Window).innerWidth > theme.breakpoints.values.lg) {
                if (!rightSidebarOpen) {
                    dispatch(show());
                }
            } else {
                if (rightSidebarOpen) {
                    dispatch(hide());
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
                        xl: rightSidebarOpen ? "360px 3fr 360px" : "360px 4fr",
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

            <PushnotificationPermissionDialog />
        </Base>
    );
}
