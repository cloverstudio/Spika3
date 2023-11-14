import React from "react";
import { Box, Button, Dialog, DialogTitle, IconButton, Typography } from "@mui/material";
import Close from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import {
    hideNoteEditModal,
    selectRightSidebarActiveNoteId,
    setActiveNoteId,
    setActiveTab,
} from "../../slices/rightSidebar";
import { useTheme } from "@mui/material/styles";
import useStrings from "../../../../hooks/useStrings";
import { useEditNoteMutation } from "../../api/note";

export const SaveNoteEditModal = () => {
    const dispatch = useAppDispatch();

    const isOpen = useAppSelector((state) => state.rightSidebar.isSaveNoteEditModalOpen);
    const noteId = useAppSelector(selectRightSidebarActiveNoteId);

    const [editNote] = useEditNoteMutation();
    const title = useAppSelector((state) => state.rightSidebar.editNoteTitle);
    const content = useAppSelector((state) => state.rightSidebar.editNoteContent);

    const theme = useTheme();
    const isDarkTheme = theme.palette.mode === "dark";

    const strings = useStrings();

    const closeModalHandler = () => {
        dispatch(hideNoteEditModal());
    };

    const discardHandler = () => {
        dispatch(hideNoteEditModal());
        dispatch(setActiveTab("notes"));
    };

    const saveHandler = async () => {
        if (!title || !content) {
            return;
        }
        const data = await editNote({ noteId, data: { title, content } }).unwrap();
        if (data?.note?.id) {
            dispatch(setActiveNoteId(data.note.id));
        }
        dispatch(hideNoteEditModal());
    };

    if (!noteId) {
        return null;
    }

    return (
        <Dialog
            open={isOpen}
            onClose={closeModalHandler}
            maxWidth="xs"
            sx={{
                "& .MuiDialog-paper": {
                    width: "360px",
                    height: "200px",
                    backgroundColor: isDarkTheme ? "default" : "#fff",
                    borderRadius: "16px",
                    padding: "0px",
                    margin: "0px",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    alignContent: "space-between",
                    alignItems: "center",
                    height: "100%",
                    width: "100%",
                    p: "0 19px",
                }}
            >
                <DialogTitle sx={{ textAlign: "center", p: 0, m: 0 }}>
                    {strings.saveEditsTitle}
                </DialogTitle>

                <IconButton
                    size="large"
                    sx={{
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        position: "absolute",
                        right: 20,
                        top: 19,
                        p: 0,
                    }}
                    onClick={closeModalHandler}
                >
                    <Close />
                </IconButton>

                <Typography sx={{ fontWeight: 500 }}>{strings.saveEditsContent}</Typography>

                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-evenly",
                        gap: "24px",
                    }}
                >
                    <Button
                        variant="contained"
                        fullWidth
                        size="medium"
                        onClick={discardHandler}
                        sx={{
                            borderRadius: "12px",
                            bgcolor: "text.tertiary",
                            "&:hover": {
                                bgcolor: isDarkTheme ? "#6E7780" : "#8D949A",
                            },
                        }}
                    >
                        {strings.discard}
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        size="medium"
                        disabled={!title || !content}
                        onClick={saveHandler}
                        sx={{ borderRadius: "12px" }}
                    >
                        {strings.save}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};
