import { Box } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader";

import { useGetRoomQuery } from "./api/room";
import RightSidebarContent from "./components/rightSidebar/rightSidebarContent";
import RightSidebarHeader from "./components/rightSidebar/rightSidebarHeader";
import { setActiveTab } from "./slices/rightSidebar";

export default function RightSidebar(): React.ReactElement {
    const roomId = +useParams().id;
    const dispatch = useDispatch();
    const { data: room, isLoading } = useGetRoomQuery(roomId);

    useEffect(() => {
        return () => {
            dispatch(setActiveTab("details"));
        };
    }, [roomId, dispatch]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <RightSidebarContainer>
            <RightSidebarHeader type={room.type} />
            <RightSidebarContent room={room} />
        </RightSidebarContainer>
    );
}

type RightSidebarContainerProps = {
    children: React.ReactElement | React.ReactElement[];
};

function RightSidebarContainer({ children }: RightSidebarContainerProps): React.ReactElement {
    return (
        <Box
            borderLeft="0.5px solid #C9C9CA"
            height="100vh"
            sx={{
                borderColor: "divider",
                overflowY: "auto",
                overflowX: "hidden",
                zIndex: 1100,
                backgroundColor:"background.default"
            }}
        >
            {children}
        </Box>
    );
}
