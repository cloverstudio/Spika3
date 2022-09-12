import { ArrowRightAltOutlined } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import Loader from "../../../../../components/Loader";
import { useGetNotesByRoomIdQuery } from "../../../api/note";
import { setActiveNoteId } from "../../../slice/rightSidebarSlice";

export default function RightSidebarNotesContent(): React.ReactElement {
    const roomId = +useParams().id;
    const dispatch = useDispatch();

    const { data, isLoading } = useGetNotesByRoomIdQuery(roomId);

    if (isLoading) {
        return <Loader />;
    }

    if (data.notes.length === 0) {
        return <Box p={2}>No notes here!</Box>;
    }

    return (
        <Box p={2}>
            {data.notes.map((n) => (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ cursor: "pointer" }}
                    key={n.id}
                    onClick={() => dispatch(setActiveNoteId(n.id))}
                >
                    <Typography variant="body1" fontWeight="medium">
                        {n.title}
                    </Typography>

                    <IconButton size="large">
                        <ArrowRightAltOutlined />
                    </IconButton>
                </Box>
            ))}
        </Box>
    );
}
