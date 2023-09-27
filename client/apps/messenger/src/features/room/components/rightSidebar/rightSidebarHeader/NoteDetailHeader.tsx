import React, { useState } from "react";
import { useSelector } from "react-redux";

import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import Share from "@mui/icons-material/Share";
import {
    selectRightSidebarActiveNoteId,
    setActiveTab,
    setEditNoteId,
} from "../../../slices/rightSidebar";
import { useDeleteNoteMutation, useGetNoteByIdQuery } from "../../../api/note";
import { useParams } from "react-router-dom";
import { useShowSnackBar } from "../../../../../hooks/useModal";
import useStrings from "../../../../../hooks/useStrings";
import { useAppDispatch } from "../../../../../hooks";

export default function NoteDetailHeader() {
    const strings = useStrings();
    const dispatch = useAppDispatch();
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
                <IconButton onClick={() => dispatch(setActiveTab("notes"))}>
                    <ArrowBackIos sx={{ color: "primary.main", position: "relative", left: 3 }} />
                </IconButton>
                <Typography variant="h6">{strings.noteNotFound}</Typography>
            </>
        );
    }

    const { note } = data;

    return (
        <>
            <IconButton onClick={() => dispatch(setActiveTab("notes"))}>
                <ArrowBackIos sx={{ color: "primary.main", position: "relative", left: 3 }} />
            </IconButton>
            <Box flex={1} minWidth="7.5rem" textAlign="right">
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
        <Dialog
            sx={{
                ".MuiDialog-paper": {
                    backgroundColor: "background.default",
                },
                "& .MuiDialog-paper": { width: "100%" },
            }}
            onClose={onClose}
            open={open}
            maxWidth="xs"
        >
            <DialogTitle sx={{ textAlign: "center" }}>{strings.confirm}</DialogTitle>
            <IconButton
                disableRipple
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
