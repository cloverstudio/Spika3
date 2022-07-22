import { AddCircleOutline, ArrowBackIos, Close } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    hide as hideRightSidebar,
    selectRightSidebarActiveTab,
    setActiveTab,
} from "../../../slice/rightSidebarSlice";
import EditNoteHeader from "./EditNoteHeader";
import NoteDetailHeader from "./NoteDetailHeader";

type RightSidebarHeaderProps = {
    type: string;
};

export default function RightSidebarHeader({ type }: RightSidebarHeaderProps): React.ReactElement {
    const activeTab = useSelector(selectRightSidebarActiveTab);
    const dispatch = useDispatch();

    const getSidebarContent = () => {
        if (activeTab === "details") {
            return (
                <>
                    <IconButton size="large" onClick={() => dispatch(hideRightSidebar())}>
                        <Close />
                    </IconButton>
                    {type === "private" ? (
                        <Typography variant="h6">Chat details</Typography>
                    ) : (
                        <Typography variant="h6">Group details</Typography>
                    )}
                </>
            );
        }

        if (activeTab === "notes") {
            return (
                <>
                    <IconButton size="large" onClick={() => dispatch(setActiveTab("details"))}>
                        <ArrowBackIos />
                    </IconButton>
                    <Typography variant="h6">Notes</Typography>
                    <Box ml="auto" flex={1} textAlign="right">
                        <IconButton
                            size="large"
                            onClick={() => dispatch(setActiveTab("createNote"))}
                        >
                            <AddCircleOutline />
                        </IconButton>
                    </Box>
                </>
            );
        }

        if (activeTab === "createNote") {
            return (
                <>
                    <IconButton size="large" onClick={() => dispatch(setActiveTab("notes"))}>
                        <ArrowBackIos />
                    </IconButton>
                    <Typography variant="h6">New note</Typography>
                </>
            );
        }

        if (activeTab === "noteDetail") {
            return <NoteDetailHeader />;
        }

        if (activeTab === "editNote") {
            return <EditNoteHeader />;
        }
    };

    return <RightSidebarHeaderContainer>{getSidebarContent()}</RightSidebarHeaderContainer>;
}

type RightSidebarHeaderContainerProps = {
    children: React.ReactElement | React.ReactElement[];
};

function RightSidebarHeaderContainer({
    children,
}: RightSidebarHeaderContainerProps): React.ReactElement {
    return (
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
                {children}
            </Stack>
        </Box>
    );
}