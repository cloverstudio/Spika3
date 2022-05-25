import React from "react";
import { Box, Stack, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { hide as hideRightSidebar } from "./slice/rightSidebarSlice";
import { useParams } from "react-router-dom";
import { useGetRoomQuery } from "./api/room";
import { DetailsBasicInfoView } from "./components/RightSidebarComponents/BasicInfoView";
import { DetailsAdditionalInfoView } from "./components/RightSidebarComponents/AdditionalInfoView";
import { DetailsMemberView } from "./components/RightSidebarComponents/MembersView";
import { DetailsDestructiveActionsView } from "./components/RightSidebarComponents/DestructiveActionsView";

export default function RightSidebar(): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = +useParams().id;
    const { data, isLoading } = useGetRoomQuery(roomId);
    const otherUser = data.room.users[1];
    const isItPrivate = data.room.type === "private";

    const handleDetailActions = (action: string) => {};

    return (
        <Box
            borderLeft="0.5px solid #C9C9CA"
            padding="0"
            margin="0"
            height="100vh"
            style={{ overflowY: "auto", overflowX: "hidden" }}
        >
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
