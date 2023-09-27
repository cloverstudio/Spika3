import React from "react";
import { useParams } from "react-router-dom";

import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowRightAltOutlined from "@mui/icons-material/ArrowRightAltOutlined";

import Loader from "../../../../../components/Loader";
import useStrings from "../../../../../hooks/useStrings";
import { useGetNotesByRoomIdQuery } from "../../../api/note";
import { setActiveNoteId } from "../../../slices/rightSidebar";
import { useAppDispatch } from "../../../../../hooks";

export default function RightSidebarNotesContent(): React.ReactElement {
    const strings = useStrings();
    const roomId = +useParams().id;
    const dispatch = useAppDispatch();

    const { data, isLoading } = useGetNotesByRoomIdQuery(roomId);

    if (isLoading) {
        return <Loader />;
    }

    if (data.notes.length === 0) {
        return <Box>{strings.noNotes}</Box>;
    }

    return (
        <Box>
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
