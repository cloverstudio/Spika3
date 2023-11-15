import React, { useRef, useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import useStrings from "@/hooks/useStrings";
import { Box, FormLabel, Stack, TextField } from "@mui/material";
import { useUpdateBotMutation, useRenewAccessTokenMutation } from "@/features/users/api/users";
import { useShowSnackBar } from "@/hooks/useModal";
import uploadImage from "@assets/upload-image.svg";
import FileUploader from "@/utils/FileUploader";
import ImageIcon from "@mui/icons-material/Image";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

type UpdateBotFormType = {
    displayName: string;
    accessToken: string;
    webhookUrl: string;
    shortDescription?: string;
    longDescription?: string;
};

declare const UPLOADS_BASE_URL: string;

export default function EditUserModal({ onClose, user }: { onClose: () => void; user: any }) {
    const strings = useStrings();
    const [updateBot, { isLoading }] = useUpdateBotMutation();
    const [renewAccessToken] = useRenewAccessTokenMutation();
    const showBasicSnackbar = useShowSnackBar();
    const [avatarFile, setAvatarFile] = useState<File>();
    const [avatarSrc, setAvatarSrc] = useState(
        user.avatarFileId ? `${UPLOADS_BASE_URL}/${user.avatarFileId}` : uploadImage,
    );
    const [coverFile, setCoverFile] = useState<File>();
    const [coverSrc, setCoverSrc] = useState(
        user.coverFileId ? `${UPLOADS_BASE_URL}/${user.coverFileId}` : uploadImage,
    );
    const uploadAvatarFileRef = useRef(null);
    const uploadCoverFileRef = useRef(null);

    const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setAvatarFile(uploadedFile);
        setAvatarSrc(URL.createObjectURL(uploadedFile));
    };

    const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setCoverFile(uploadedFile);
        setCoverSrc(URL.createObjectURL(uploadedFile));
    };

    const [form, setForm] = useState<UpdateBotFormType>({
        displayName: user.displayName || "",
        accessToken: user.device[0]?.token || "",
        webhookUrl: user.webhookUrl || "",
    });

    const handleChange = (key: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        try {
            let avatarFileId = 0;
            let coverFileId: number;

            if (avatarFile) {
                const fileUploader = new FileUploader({
                    file: avatarFile,
                    type: "image",
                });

                const uploadedFile = await fileUploader.upload();
                avatarFileId = uploadedFile.id;
            } else if (avatarSrc !== uploadImage) {
                avatarFileId = user.avatarFileId;
            }

            if (coverFile) {
                const fileUploader = new FileUploader({
                    file: coverFile,
                    type: "image",
                });

                const uploadedFile = await fileUploader.upload();
                coverFileId = uploadedFile.id;
            }

            const res = await updateBot({
                userId: user.id,
                data: { ...form, avatarFileId, coverFileId },
            }).unwrap();
            if (res?.status === "success") {
                showBasicSnackbar({ text: strings.botUpdated, severity: "success" });
                onClose();
            } else {
                showBasicSnackbar({ text: res.message, severity: "error" });
            }
        } catch (error) {
            showBasicSnackbar({ text: strings.genericError, severity: "error" });
        }
    };

    const handleRenewAccessToken = async () => {
        try {
            const res = await renewAccessToken({
                userId: user.id,
            }).unwrap();
            if (res?.status === "success") {
                showBasicSnackbar({ text: strings.botUpdated, severity: "success" });
                handleChange("accessToken", res.data.device.token);
            } else {
                showBasicSnackbar({ text: res.message, severity: "error" });
            }
        } catch (error) {
            showBasicSnackbar({ text: strings.genericError, severity: "error" });
        }
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
                        <Box>
                            <Box
                                width="100%"
                                height="150px"
                                bgcolor="white"
                                borderRadius="8px"
                                position="relative"
                                mb="40px"
                                fontSize={50}
                                sx={{
                                    cursor: "pointer",
                                }}
                            >
                                {coverSrc !== uploadImage ? (
                                    <img
                                        src={coverSrc}
                                        alt="cover"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            objectPosition: "top",
                                            borderRadius: "8px",
                                        }}
                                        onClick={() => uploadCoverFileRef.current?.click()}
                                    />
                                ) : (
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        width="100%"
                                        height="100%"
                                        onClick={() => uploadCoverFileRef.current?.click()}
                                    >
                                        <ImageIcon fontSize="inherit" color="primary" />
                                    </Box>
                                )}
                                <input
                                    onChange={handleCoverFileUpload}
                                    type="file"
                                    style={{ display: "none" }}
                                    ref={uploadCoverFileRef}
                                    accept="image/*"
                                />
                                <Box
                                    position="absolute"
                                    borderRadius="50%"
                                    bottom={-40}
                                    left={10}
                                    fontSize={50}
                                    width="100px"
                                    height="100px"
                                    border="2px solid gray"
                                    bgcolor="white"
                                    sx={{ cursor: "pointer" }}
                                    zIndex={1}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        uploadAvatarFileRef.current?.click();
                                    }}
                                >
                                    {avatarSrc !== uploadImage ? (
                                        <img
                                            src={avatarSrc}
                                            alt="avatar"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                borderRadius: "50%",
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            display="flex"
                                            width="100px"
                                            height="100px"
                                            justifyContent="center"
                                            alignItems="center"
                                        >
                                            <CameraAltIcon fontSize="inherit" color="primary" />
                                        </Box>
                                    )}
                                </Box>
                                <input
                                    onChange={handleAvatarFileUpload}
                                    type="file"
                                    style={{ display: "none" }}
                                    ref={uploadAvatarFileRef}
                                    accept="image/*"
                                />
                            </Box>
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
                                {strings.accessToken}
                            </FormLabel>

                            <Box>
                                <TextField
                                    required
                                    fullWidth
                                    id="token"
                                    placeholder={strings.enter}
                                    name="token"
                                    autoComplete="token"
                                    value={form.accessToken}
                                    onChange={({ target }) =>
                                        handleChange("accessToken", target.value)
                                    }
                                    disabled
                                    sx={{
                                        width: "70%",
                                        marginRight: "10%",
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    disabled={isLoading}
                                    color="primary"
                                    onClick={handleRenewAccessToken}
                                    sx={{
                                        width: "20%",
                                    }}
                                >
                                    {strings.renewAccessToken}
                                </Button>
                            </Box>
                        </Box>

                        <Box>
                            <FormLabel sx={{ mb: 1, display: "block" }}>
                                {strings.webhookurl}
                            </FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="webhookurl"
                                placeholder={strings.enter}
                                name="webhookurl"
                                autoComplete="webhookurl"
                                value={form.webhookUrl}
                                onChange={({ target }) => handleChange("webhookUrl", target.value)}
                            />
                        </Box>
                        <Box>
                            <FormLabel sx={{ mb: 1, display: "block" }}>
                                {strings.shortDescription}
                            </FormLabel>
                            <TextField
                                fullWidth
                                id="shortDescription"
                                name="shortDescription"
                                value={form.shortDescription}
                                onChange={({ target }) =>
                                    handleChange("shortDescription", target.value)
                                }
                                multiline
                                rows={2}
                            />
                        </Box>
                        <Box>
                            <FormLabel sx={{ mb: 1, display: "block" }}>
                                {strings.longDescription}
                            </FormLabel>
                            <TextField
                                multiline
                                fullWidth
                                rows={4}
                                id="longDescription"
                                name="longDescription"
                                value={form.longDescription}
                                onChange={({ target }) =>
                                    handleChange("longDescription", target.value)
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
