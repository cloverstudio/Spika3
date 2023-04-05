import React, { useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import useStrings from "@/hooks/useStrings";
import { Box, FormLabel, Stack, TextField, Typography } from "@mui/material";
import { useShowSnackBar } from "@/hooks/useModal";
import uploadImage from "@assets/upload-image.svg";
import FileUploader from "@/utils/FileUploader";
import { useUpdateGroupMutation } from "@/features/groups/api/groups";

type UpdateUserFormType = {
    name: string;
};

declare const UPLOADS_BASE_URL: string;

export default function EditGroupModal({ onClose, group }: { onClose: () => void; group: any }) {
    const strings = useStrings();
    const [updateGroup, { isLoading }] = useUpdateGroupMutation();
    const showBasicSnackbar = useShowSnackBar();
    const [file, setFile] = useState<File>();
    const [src, setSrc] = useState(
        group.avatarFileId ? `${UPLOADS_BASE_URL}/${group.avatarFileId}` : uploadImage
    );
    const uploadFileRef = useRef(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setFile(uploadedFile);
        setSrc(URL.createObjectURL(uploadedFile));
    };

    const [form, setForm] = useState<UpdateUserFormType>({
        name: group.name || "",
    });

    const handleChange = (key: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        try {
            let avatarFileId = group.avatarFileId || 0;

            if (file) {
                const fileUploader = new FileUploader({
                    file,
                    type: "image",
                });

                const uploadedFile = await fileUploader.upload();
                avatarFileId = uploadedFile.id;
            }

            const res = await updateGroup({
                groupId: group.id,
                data: { ...form, avatarFileId },
            }).unwrap();

            if (res?.status === "success") {
                showBasicSnackbar({ text: strings.groupUpdated, severity: "success" });
                onClose();
            } else {
                showBasicSnackbar({ text: res.message, severity: "error" });
            }
        } catch (error) {
            showBasicSnackbar({ text: strings.genericError, severity: "error" });
        }
    };

    const handleRemoveImage = () => {
        setSrc(uploadImage);
    };

    return (
        <Dialog
            open={true}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{strings.editGroup}</DialogTitle>
            <DialogContent>
                <Box minWidth={{ xs: "100%", md: "350px" }} textAlign="left" component="form">
                    <Stack spacing={2} mb={3}>
                        <Box mx="auto" textAlign="center">
                            <img
                                width="100px"
                                height="100px"
                                style={{
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                }}
                                src={src}
                                onClick={() => uploadFileRef.current?.click()}
                            />
                            <input
                                onChange={handleFileUpload}
                                type="file"
                                style={{ display: "none" }}
                                ref={uploadFileRef}
                                accept="image/*"
                            />

                            {src !== uploadImage && (
                                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                                    {strings.uploadImageInstructions} <br />
                                    <Box
                                        sx={{ cursor: "pointer" }}
                                        fontSize="0.85rem"
                                        textAlign="center"
                                        color="red"
                                        onClick={handleRemoveImage}
                                    >
                                        {strings.removeImage}
                                    </Box>
                                </Typography>
                            )}
                        </Box>
                        <Box>
                            <FormLabel sx={{ mb: 1, display: "block" }}>{strings.name}</FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="name"
                                placeholder={strings.enter}
                                name="name"
                                autoComplete="name"
                                autoFocus
                                value={form.name}
                                onChange={({ target }) => handleChange("name", target.value)}
                            />
                        </Box>
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="inherit" onClick={onClose}>
                    {strings.cancel}
                </Button>
                <Button
                    variant="contained"
                    disabled={isLoading}
                    color="primary"
                    onClick={handleSubmit}
                >
                    {strings.save}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
