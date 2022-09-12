import React, { useState } from "react";
import { Box, IconButton, Typography, Dialog, DialogTitle, Button } from "@mui/material";
import { ArrowBackIos, Close, Delete, Edit } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
    selectRightSidebarActiveNoteId,
    setActiveTab,
    setEditNoteId,
} from "../../../slice/rightSidebarSlice";
import { useDeleteNoteMutation, useGetNoteByIdQuery } from "../../../api/note";

export default function NoteDetailHeader() {
    const dispatch = useDispatch();
    const noteId = useSelector(selectRightSidebarActiveNoteId);
    const { data, isLoading } = useGetNoteByIdQuery(noteId);
    const [deleteNoteOpenDialog, setDeleteNoteOpenDialog] = useState(false);
    const [deleteNote] = useDeleteNoteMutation();

    if (isLoading) {
        return null;
    }

    const { note } = data;

    const handleDelete = async () => {
        await deleteNote(noteId).unwrap();
        dispatch(setActiveTab("notes"));
    };

    return (
        <>
            <IconButton size="large" onClick={() => dispatch(setActiveTab("notes"))}>
                <ArrowBackIos />
            </IconButton>
            <Typography variant="h6">{note.title}</Typography>
            <Box ml="auto" flex={1} textAlign="right">
                <IconButton size="large" onClick={() => dispatch(setEditNoteId(note.id))}>
                    <Edit />
                </IconButton>
                <IconButton
                    size="large"
                    sx={{ color: "error.main" }}
                    onClick={() => setDeleteNoteOpenDialog(true)}
                >
                    <Delete />
                </IconButton>
            </Box>
            <DeleteNoteDialog
                open={deleteNoteOpenDialog}
                onClose={() => setDeleteNoteOpenDialog(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}

type DeleteNoteDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

function DeleteNoteDialog({ onClose, open, onConfirm }: DeleteNoteDialogProps) {
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle sx={{ textAlign: "center" }}>Confirm</DialogTitle>
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    margin: "0",
                    padding: "5px",
                    position: "absolute",
                    right: "10px",
                    top: "12px",
                }}
                onClick={onClose}
            >
                <Close />
            </IconButton>
            <Box sx={{ width: "300px", margin: 2 }}>
                <Typography variant="body1">Are you sure?</Typography>
            </Box>
            <Button
                variant="contained"
                size="medium"
                sx={{ margin: 2 }}
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
            >
                Yes, delete
            </Button>
        </Dialog>
    );
}
