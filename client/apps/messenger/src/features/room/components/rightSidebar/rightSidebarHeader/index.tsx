import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import Close from "@mui/icons-material/Close";

import {
    hideRightSidebar,
    selectRightSidebarActiveTab,
    setActiveTab,
} from "../../../slices/rightSidebar";
import EditNoteHeader from "./EditNoteHeader";
import SettingsHeader from "./SettingsHeader";
import NoteDetailHeader from "./NoteDetailHeader";
import useStrings from "../../../../../hooks/useStrings";

type RightSidebarHeaderProps = {
    type: string;
};

export default function RightSidebarHeader({ type }: RightSidebarHeaderProps): React.ReactElement {
    const strings = useStrings();
    const activeTab = useSelector(selectRightSidebarActiveTab);
    const dispatch = useDispatch();

    const getSidebarContent = () => {
        if (activeTab === "details") {
            return (
                <>
                    <IconButton onClick={() => dispatch(hideRightSidebar())}>
                        <Close />
                    </IconButton>
                    {type === "private" ? (
                        <Typography variant="h6">{strings.chatDetails}</Typography>
                    ) : (
                        <Typography variant="h6">{strings.groupDetails}</Typography>
                    )}
                </>
            );
        }

        if (activeTab === "notes") {
            return (
                <>
                    <IconButton onClick={() => dispatch(setActiveTab("details"))}>
                        <ArrowBackIos
                            sx={{ color: "primary.main", position: "relative", left: 3 }}
                        />
                    </IconButton>
                    <Typography variant="h6">{strings.notes}</Typography>
                    <Box ml="auto" flex={1} textAlign="right">
                        <IconButton onClick={() => dispatch(setActiveTab("createNote"))}>
                            <AddCircleOutline />
                        </IconButton>
                    </Box>
                </>
            );
        }

        if (activeTab === "createNote") {
            return (
                <>
                    <IconButton onClick={() => dispatch(setActiveTab("notes"))}>
                        <ArrowBackIos
                            sx={{ color: "primary.main", position: "relative", left: 3 }}
                        />
                    </IconButton>
                    <Typography variant="h6">{strings.newNote}</Typography>
                </>
            );
        }

        if (activeTab === "noteDetail") {
            return <NoteDetailHeader />;
        }

        if (activeTab === "editNote") {
            return <EditNoteHeader />;
        }

        if (activeTab === "settings") {
            return <SettingsHeader />;
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
        <Box height="80.5px" px={2} borderBottom="0.5px solid" sx={{ borderColor: "divider" }}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "left",
                    paddingTop: "20px",
                }}
            >
                {children}
            </Stack>
        </Box>
    );
}
