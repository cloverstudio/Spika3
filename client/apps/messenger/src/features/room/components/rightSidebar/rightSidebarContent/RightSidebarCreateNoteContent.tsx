import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { useTranslation } from "react-i18next";

import { useCreateNoteMutation } from "../../../api/note";
import { setActiveNoteId } from "../../../slices/rightSidebar";
import { useAppDispatch } from "../../../../../hooks";

export default function RightSidebarCreateNoteContent(): React.ReactElement {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
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
        <Box>
            <TextField
                sx={{ mb: 2 }}
                required
                fullWidth
                id="name"
                placeholder={t("title")}
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
                placeholder={t("description")}
                name="name"
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
                {t("create")}
            </Button>
        </Box>
    );
}
