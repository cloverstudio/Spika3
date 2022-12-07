import React, { useState } from "react";
import { Box, IconButton, Typography, Dialog, DialogTitle, Button } from "@mui/material";
import { ArrowBackIos, Close, Delete, Edit, Share } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
    selectRightSidebarActiveNoteId,
    setActiveTab,
    setEditNoteId,
} from "../../../slices/rightSidebar";
import { useDeleteNoteMutation, useGetNoteByIdQuery } from "../../../api/note";
import { useParams } from "react-router-dom";
import { useShowSnackBar } from "../../../../../hooks/useModal";
import useStrings from "../../../../../hooks/useStrings";

export default function NoteDetailHeader() {
    const strings = useStrings();
    const dispatch = useDispatch();
    const noteId = useSelector(selectRightSidebarActiveNoteId);
    const roomId = +useParams().id;
    const showSnackbar = useShowSnackBar();
    const { data, isLoading } = useGetNoteByIdQuery(noteId);
    const [deleteNoteOpenDialog, setDeleteNoteOpenDialog] = useState(false);
    const [deleteNote] = useDeleteNoteMutation();

    const handleDelete = async () => {
        await deleteNote(noteId).unwrap();
        dispatch(setActiveTab("notes"));
    };

    const handleCopyNoteLink = () => {
        navigator.clipboard.writeText(`${window.origin}/messenger/rooms/${roomId}/notes/${noteId}`);

        showSnackbar({
            severity: "success",
            text: strings.linkCopied,
        });
    };

    if (isLoading) {
        return null;
    }

    if (!data) {
        return (
            <>
                <IconButton size="large" onClick={() => dispatch(setActiveTab("notes"))}>
                    <ArrowBackIos />
                </IconButton>
                <Typography variant="h6">{strings.noteNotFound}</Typography>
            </>
        );
    }

    const { note } = data;

    return (
        <>
            <IconButton size="large" onClick={() => dispatch(setActiveTab("notes"))}>
                <ArrowBackIos />
            </IconButton>
            <Typography variant="h6">{note.title}</Typography>
            <Box ml="auto" flex={1} textAlign="right">
                <IconButton onClick={handleCopyNoteLink}>
                    <Share />
                </IconButton>
                <IconButton onClick={() => dispatch(setEditNoteId(note.id))}>
                    <Edit />
                </IconButton>
                <IconButton
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
    const strings = useStrings();
    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle sx={{ textAlign: "center" }}>{strings.confirm}</DialogTitle>
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
                <Typography variant="body1">{strings.areYouSure}</Typography>
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
                {strings.yesDelete}
            </Button>
        </Dialog>
    );
}
