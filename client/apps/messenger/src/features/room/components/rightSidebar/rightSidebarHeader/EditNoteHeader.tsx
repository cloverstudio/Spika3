import React from "react";
import { useSelector } from "react-redux";

import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import useStrings from "../../../../../hooks/useStrings";

import { useEditNoteMutation, useGetNoteByIdQuery } from "../../../api/note";
import { selectRightSidebarActiveNoteId, setActiveNoteId } from "../../../slices/rightSidebar";
import { useAppDispatch, useAppSelector } from "../../../../../hooks";

export default function EditNoteHeader() {
    const strings = useStrings();
    const dispatch = useAppDispatch();
    const noteId = useSelector(selectRightSidebarActiveNoteId);

    const { data, isLoading } = useGetNoteByIdQuery(noteId);

    const [editNote] = useEditNoteMutation();
    const title = useAppSelector((state) => state.rightSidebar.editNoteTitle);
    const content = useAppSelector((state) => state.rightSidebar.editNoteContent);

    const handleSubmit = async () => {
        if (!title || !content) {
            return;
        }
        const data = await editNote({ noteId, data: { title, content } }).unwrap();
        if (data?.note?.id) {
            dispatch(setActiveNoteId(data.note.id));
        }
    };

    if (isLoading) {
        return null;
    }

    const { note } = data;

    return (
        <>
            <IconButton
                onClick={() => dispatch(setActiveNoteId(note.id))}
                style={{ borderRadius: "10px" }}
            >
                <ArrowBackIos sx={{ color: "primary.main", position: "relative", left: 3 }} />
            </IconButton>
            <Typography variant="h6">{strings.editNote}</Typography>
            <IconButton
                sx={{
                    position: "absolute",
                    right: "26px",
                    borderRadius: "10px",
                }}
                disabled={!title || !content}
                onClick={handleSubmit}
            >
                <Typography sx={{ color: "primary.main", fontWeight: "700", fontSize: "18px" }}>
                    {strings.save}
                </Typography>
            </IconButton>
        </>
    );
}
