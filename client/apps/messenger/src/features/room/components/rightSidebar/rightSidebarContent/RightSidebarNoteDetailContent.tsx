import { Box } from "@mui/material";
import MuiMarkdown from "mui-markdown";
import React from "react";
import { useSelector } from "react-redux";

import { useGetNoteByIdQuery } from "../../../api/note";
import { selectRightSidebarActiveNoteId } from "../../../slices/rightSidebar";

export default function RightSidebarNoteDetailContent() {
    const noteId = useSelector(selectRightSidebarActiveNoteId);

    const { data, isLoading } = useGetNoteByIdQuery(noteId);

    if (isLoading) {
        return null;
    }

    if (!data) {
        return null;
    }

    return (
        <Box m={2}>
            <MuiMarkdown
                overrides={{
                    h1: {
                        props: {
                            fontSize: "1.25rem",
                        },
                    },
                    h2: {
                        props: {
                            fontSize: "1.15rem",
                        },
                    },
                    h3: {
                        props: {
                            fontSize: "1.05rem",
                        },
                    },
                    h4: {
                        props: {
                            fontSize: "1.00rem",
                        },
                    },
                }}
            >
                {data.note.content}
            </MuiMarkdown>
        </Box>
    );
}
