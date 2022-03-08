import React, { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Base from "../components/Base";
import LeftSidebar from "../features/chat/LeftSidebar";
import { selectLeftSidebarOpen, setLeftSidebar } from "../features/chat/slice/sidebarSlice";

export default function Home(): React.ReactElement {
    const { id } = useParams();
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const dispatch = useDispatch();
    const open = useSelector(selectLeftSidebarOpen);

    useEffect(() => {
        if (isMobile) {
            dispatch(setLeftSidebar(true));
        }
    }, [isMobile, dispatch]);

    const isRoomPage = !!id;

    const setOpen = () => dispatch(setLeftSidebar(!open));
    return (
        <Base>
            <Box
                display="grid"
                sx={{
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "minmax(320px, 420px) minmax(580px, 1fr)",
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
                {isRoomPage ? (
                    <Outlet />
                ) : (
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        Select or create room
                    </Box>
                )}
            </Box>
        </Base>
    );
}
