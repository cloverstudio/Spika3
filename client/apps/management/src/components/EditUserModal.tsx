import React, { useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import useStrings from "@/hooks/useStrings";
import { Box, Checkbox, FormLabel, Stack, TextField, Typography } from "@mui/material";
import { useUpdateUserMutation } from "@/features/users/api/users";
import { useShowSnackBar } from "@/hooks/useModal";
import uploadImage from "@assets/upload-image.svg";
import FileUploader from "@/utils/FileUploader";

type UpdateUserFormType = {
    displayName: string;
    telephoneNumber: string;
    emailAddress: string;
    verified: boolean;
    verificationCode: string;
};

declare const UPLOADS_BASE_URL: string;

export default function EditUserModal({ onClose, user }: { onClose: () => void; user: any }) {
    const strings = useStrings();
    const [updateUser, { isLoading }] = useUpdateUserMutation();
    const showBasicSnackbar = useShowSnackBar();
    const [file, setFile] = useState<File>();
    const [src, setSrc] = useState(
        user.avatarFileId ? `${UPLOADS_BASE_URL}/${user.avatarFileId}` : uploadImage
    );
    const uploadFileRef = useRef(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setFile(uploadedFile);
        setSrc(URL.createObjectURL(uploadedFile));
    };

    const [form, setForm] = useState<UpdateUserFormType>({
        displayName: user.displayName || "",
        telephoneNumber: user.telephoneNumber || "",
        emailAddress: user.emailAddress || "",
        verified: user.verified || false,
        verificationCode: user.verificationCode || "",
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

            const res = await updateUser({
                userId: user.id,
                data: { ...form, avatarFileId },
            }).unwrap();
            if (res?.status === "success") {
                showBasicSnackbar({ text: strings.userUpdated, severity: "success" });
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
            <DialogTitle id="alert-dialog-title">{strings.editUser}</DialogTitle>
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
                                {strings.telephoneNumber}
                            </FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="telephoneNumber"
                                placeholder={strings.enter}
                                name="telephoneNumber"
                                autoComplete="telephoneNumber"
                                value={form.telephoneNumber}
                                onChange={({ target }) =>
                                    handleChange("telephoneNumber", target.value)
                                }
                            />
                        </Box>

                        <Box>
                            <FormLabel sx={{ mb: 1, display: "block" }}>
                                {strings.emailAddress}
                            </FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="emailAddress"
                                placeholder={strings.enter}
                                name="emailAddress"
                                autoComplete="emailAddress"
                                value={form.emailAddress}
                                onChange={({ target }) =>
                                    handleChange("emailAddress", target.value)
                                }
                            />
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            <FormLabel sx={{ display: "block" }}>{strings.verified}</FormLabel>

                            <Checkbox
                                id="verified"
                                checked={form.verified}
                                onChange={({ target }) => handleChange("verified", target.checked)}
                            />
                        </Box>

                        <Box>
                            <FormLabel sx={{ mb: 1, display: "block" }}>
                                {strings.verificationCode}
                            </FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="verificationCode"
                                placeholder={strings.enter}
                                name="verificationCode"
                                autoComplete="verificationCode"
                                value={form.verificationCode}
                                type="text"
                                onChange={({ target }) =>
                                    handleChange("verificationCode", target.value)
                                }
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
