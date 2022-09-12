import { Box, Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useEditNoteMutation, useGetNoteByIdQuery } from "../../../api/note";
import { selectRightSidebarActiveNoteId, setActiveNoteId } from "../../../slice/rightSidebarSlice";

export default function RightSidebarEditNoteContent(): React.ReactElement {
    const noteId = useSelector(selectRightSidebarActiveNoteId);

    const { data } = useGetNoteByIdQuery(noteId);

    const dispatch = useDispatch();
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
        <Box m={2}>
            <TextField
                sx={{ mb: 2 }}
                required
                fullWidth
                placeholder="Title"
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
                placeholder="Description..."
                id="content"
                name="content"
                rows={36}
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
                Save
            </Button>
        </Box>
    );
}
