import React from "react";
import { Box, Stack, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { hide as hideRightSidebar } from "./slice/rightSidebarSlice";
import { useParams } from "react-router-dom";
import { useGetRoomQuery } from "./api/room";
import { DetailsBasicInfoView } from "../chat/components/RightSidebarComponents/RightSidebarBasicInfoView";
import { DetailsAdditionalInfoView } from "../chat/components/RightSidebarComponents/RightSidebarAdditionalInfoView";
import { DetailsMemberView } from "../chat/components/RightSidebarComponents/RightSidebarMembersView";
import { DetailsDestructiveActionsView } from "../chat/components/RightSidebarComponents/RightSidebarDestructiveActionsView";

declare const UPLOADS_BASE_URL: string;

const debounce = (fn: any, delay: any) => {
    let timerId: any;
    return (...args: any[]) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn(...args), delay);
    };
};

export default function RightSidebar(): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = +useParams().id;
    const { data, isLoading } = useGetRoomQuery(roomId);
    const otherUser = data.room.users[1];
    const isItPrivate = data.room.type === "private";

    const handleDetailActions = (action: string) => {};

    return (
        <Box borderLeft="0.5px solid #C9C9CA" padding="0" margin="0">
            <Box height="80.5px" borderBottom="0.5px solid #C9C9CA">
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "left",
                        paddingTop: "15px",
                    }}
                >
                    <IconButton
                        size="large"
                        onClick={(e) => {
                            dispatch(hideRightSidebar());
                        }}
                    >
                        <Close />
                    </IconButton>
                    {isItPrivate ? (
                        <Typography variant="h6">Chat details</Typography>
                    ) : (
                        <Typography variant="h6">Group details</Typography>
                    )}
                </Stack>
            </Box>
            <DetailsBasicInfoView roomData={data.room} />
            <DetailsAdditionalInfoView selectedInfo={handleDetailActions} />
            {!isItPrivate ? <DetailsMemberView members={data.room.users} roomId={roomId} /> : null}
            <DetailsDestructiveActionsView isItPrivateChat={isItPrivate} otherUser={otherUser} />
        </Box>
    );
}
