import { Box } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { useGetRoomQuery } from "./api/room";
import RightSidebarContent from "./components/rightSidebarComponents/rightSidebarContent";
import RightSidebarHeader from "./components/rightSidebarComponents/rightSidebarHeader";
import { setActiveTab } from "./slice/rightSidebarSlice";

export default function RightSidebar(): React.ReactElement {
    const roomId = +useParams().id;
    const dispatch = useDispatch();
    const { data, isLoading } = useGetRoomQuery(roomId);

    useEffect(() => {
        return () => {
            dispatch(setActiveTab("details"));
        };
    }, [roomId, dispatch]);

    if (isLoading) {
        return <Box>Loading...</Box>;
    }

    const { room } = data;

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
            padding="0"
            margin="0"
            height="100vh"
            style={{ overflowY: "auto", overflowX: "hidden" }}
        >
            {children}
        </Box>
    );
}
