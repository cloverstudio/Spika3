import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import useStrings from "../../../../../hooks/useStrings";

import { useEditNoteMutation, useGetNoteByIdQuery } from "../../../api/note";
import { selectRightSidebarActiveNoteId, setActiveNoteId } from "../../../slices/rightSidebar";
import { useAppDispatch } from "../../../../../hooks";

export default function RightSidebarEditNoteContent(): React.ReactElement {
    const strings = useStrings();
    const noteId = useSelector(selectRightSidebarActiveNoteId);

    const { data } = useGetNoteByIdQuery(noteId);

    const dispatch = useAppDispatch();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [editNote, { isLoading }] = useEditNoteMutation();

    useEffect(() => {
        if (data && data.note) {
            setTitle(data.note.title);
            setContent(data.note.content);
        }
    }, [data]);

    const handleSubmit = async () => {
        const data = await editNote({ noteId, data: { title, content } }).unwrap();
        if (data?.note?.id) {
            dispatch(setActiveNoteId(data.note.id));
        }
    };

    return (
        <Box>
            <TextField
                sx={{ mb: 2 }}
                required
                fullWidth
                placeholder={strings.title}
                id="title"
                name="title"
                autoFocus
                value={title}
                onChange={({ target }) => setTitle(target.value)}
            />
            <TextField
                sx={{ mb: 2 }}
                required
                fullWidth
                placeholder={strings.description}
                id="content"
                name="content"
                minRows={20}
                multiline
                value={content}
                onChange={({ target }) => setContent(target.value)}
            />
            <Button
                onClick={handleSubmit}
                disabled={!title || !content || isLoading}
                fullWidth
                variant="contained"
                sx={{ marginTop: "1em" }}
            >
                {strings.save}
            </Button>
        </Box>
    );
}
