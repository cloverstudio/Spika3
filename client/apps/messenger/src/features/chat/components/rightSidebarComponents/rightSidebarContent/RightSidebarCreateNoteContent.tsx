import { Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { useCreateNoteMutation } from "../../../api/note";
import { setActiveNoteId } from "../../../slice/rightSidebarSlice";

export default function RightSidebarCreateNoteContent(): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = +useParams().id;
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [createNote, { isLoading }] = useCreateNoteMutation();

    const handleSubmit = async () => {
        const data = await createNote({ title, content, roomId }).unwrap();
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
                id="name"
                placeholder="Title"
                name="name"
                autoFocus
                value={title}
                onChange={({ target }) => setTitle(target.value)}
            />
            <TextField
                sx={{ mb: 2 }}
                required
                fullWidth
                id="name"
                placeholder="Description..."
                name="name"
                rows={36}
                multiline
                autoFocus
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
                Create
            </Button>
        </Box>
    );
}
