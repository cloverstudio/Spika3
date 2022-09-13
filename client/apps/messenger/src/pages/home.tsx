import React, { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Base from "../components/Base";
import PushnotificationPermissionDialog from "../components/PushnotificationPermissionDialog";
import LeftSidebar from "../features/chat/LeftSidebar";
import RightSidebar from "../features/chat/RightSidebar";
import { selectLeftSidebarOpen, setLeftSidebar } from "../features/chat/slice/sidebarSlice";

import { selectRightSidebarOpen } from "../features/chat/slice/rightSidebarSlice";

import { selectUserId, fetchMe, fetchSettings } from "../../src/store/userSlice";

export default function Home(): React.ReactElement {
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const dispatch = useDispatch();
    const open = useSelector(selectLeftSidebarOpen);
    const rightSidebarOpen = useSelector(selectRightSidebarOpen);

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
                        md: rightSidebarOpen
                            ? "minmax(320px, 420px) minmax(580px, 1fr) minmax(320px, 420px)"
                            : "minmax(320px, 420px) minmax(580px, 1fr) ",
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
