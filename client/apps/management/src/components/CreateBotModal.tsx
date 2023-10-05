import React, { useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import useStrings from "@/hooks/useStrings";
import { Box, FormLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useCreateBotMutation } from "@/features/users/api/users";
import { useShowSnackBar } from "@/hooks/useModal";
import uploadImage from "@assets/upload-image.svg";
import FileUploader from "@/utils/FileUploader";
import { useParams } from "react-router-dom";

type CreateUserFormType = {
    displayName: string;
    webhookUrl: string;
};

export default function CreateUserModal({ onClose }: { onClose: () => void }) {
    const strings = useStrings();
    const [createBot, { isLoading }] = useCreateBotMutation();
    const showBasicSnackbar = useShowSnackBar();
    const [file, setFile] = useState<File>();
    const [src, setSrc] = useState(uploadImage);
    const uploadFileRef = useRef(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setFile(uploadedFile);
        setSrc(URL.createObjectURL(uploadedFile));
    };

    const [form, setForm] = useState<CreateUserFormType>({
        displayName: "",
        webhookUrl: ""
    });

    const handleChange = (key: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        try {
            let avatarFileId = 0;

            if (file) {
                const fileUploader = new FileUploader({
                    file,
                    type: "image",
                });

                const uploadedFile = await fileUploader.upload();
                avatarFileId = uploadedFile.id;
            }

            const res = await createBot({ ...form, avatarFileId }).unwrap();
            if (res?.status === "success") {
                showBasicSnackbar({ text: strings.botCreated, severity: "success" });
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
            <DialogTitle id="alert-dialog-title">{strings.createBot}</DialogTitle>
            <DialogContent>
                <Box minWidth={{ xs: "100%", md: "350px" }} textAlign="left">
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
                            <FormLabel sx={{ mb: 1, display: "block" }}>
                                {strings.displayName}
                            </FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="displayName"
                                placeholder={strings.enter}
                                name="displayName"
                                autoComplete="displayName"
                                autoFocus
                                value={form.displayName}
                                onChange={({ target }) => handleChange("displayName", target.value)}
                            />
                        </Box>
                        <Box>
                            <FormLabel sx={{ mb: 1, display: "block" }}>
                                {strings.webhookurl}
                            </FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="webhook"
                                placeholder={strings.enter}
                                name="webhook"
                                autoComplete="https://"
                                autoFocus
                                value={form.webhookUrl}
                                onChange={({ target }) => handleChange("webhookUrl", target.value)}
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
