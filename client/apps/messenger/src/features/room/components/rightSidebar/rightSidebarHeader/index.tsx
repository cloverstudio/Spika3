import React from "react";
import { useSelector } from "react-redux";

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
import NavigateBackHeader from "./NavigateBackHeader";
import NoteDetailHeader from "./NoteDetailHeader";
import useStrings from "../../../../../hooks/useStrings";
import { useAppDispatch } from "../../../../../hooks";

type RightSidebarHeaderProps = {
    type: string;
};

export default function RightSidebarHeader({ type }: RightSidebarHeaderProps): React.ReactElement {
    const strings = useStrings();
    const activeTab = useSelector(selectRightSidebarActiveTab);
    const dispatch = useAppDispatch();

    const getSidebarContent = () => {
        if (activeTab === "notes") {
            return (
                <>
                    <IconButton
                        onClick={() => dispatch(setActiveTab("details"))}
                        style={{ borderRadius: "10px" }}
                    >
                        <ArrowBackIos
                            sx={{ color: "primary.main", position: "relative", left: 3 }}
                        />
                    </IconButton>
                    <Typography variant="h6">{strings.notes}</Typography>
                    <Box ml="auto" flex={1} textAlign="right">
                        <IconButton
                            onClick={() => dispatch(setActiveTab("createNote"))}
                            style={{ borderRadius: "10px" }}
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
                    <IconButton
                        onClick={() => dispatch(setActiveTab("notes"))}
                        style={{ borderRadius: "10px" }}
                    >
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
            return <NavigateBackHeader headerTitle={strings.settings} />;
        }

        if (activeTab === "media") {
            return <NavigateBackHeader headerTitle={strings.sharedMediaLinksAndDocs} />;
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
    const activeTab = useSelector(selectRightSidebarActiveTab);

    if (activeTab === "details") return null;

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
