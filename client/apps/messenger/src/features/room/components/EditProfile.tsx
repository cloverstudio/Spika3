import React, { useState, useRef, useEffect } from "react";
import {
    Avatar,
    Box,
    IconButton,
    Typography,
    Stack,
    Link,
    Button,
    Dialog,
    DialogTitle,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    CircularProgress,
} from "@mui/material";

import { ArrowBackIos, CameraAlt, ChevronRight, Close } from "@mui/icons-material";
import uploadFile from "../../../utils/uploadFile";

import { useUpdateUserAvatarMutation } from "../../auth/api/auth";

import { crop } from "../../../utils/crop";

import * as Constants from "../../../../../../lib/constants";
import { useNavigate } from "react-router-dom";
import EditPersonalInfoDialog from "./EditPersonalInfoDialog";

declare const UPLOADS_BASE_URL: string;

export interface EditProfileProps {
    onClose: () => void;
    user: any;
}

export function EditProfileView({ onClose, user }: EditProfileProps) {
    const imageRef = useRef(null);
    const [editingProfilePicture, setEditingProfilePicture] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
    const [updateAvatar] = useUpdateUserAvatarMutation();
    const navigate = useNavigate();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLoading(true);

            const selectedFile = e.target.files && e.target.files[0];
            const objectUrl = URL.createObjectURL(selectedFile);

            const croppedImage = await crop(
                objectUrl,
                1,
                Constants.LSKEY_CROPSIZE,
                Constants.LSKEY_CROPSIZE
            );

            const file = new File([croppedImage], "image.png");

            const uploadedFile = await uploadFile({
                file,
                type: "avatar",
                relationId: user.id,
            });

            await updateAvatar({
                avatarUrl: uploadedFile.path,
                avatarFileId: uploadedFile.id,
            }).unwrap();
        } catch (error) {
            console.error("Update failed ", error);
        }
        setLoading(false);
    };

    const selectedEditAction = async (editAction: string) => {
        if (editAction === "upload") {
            imageRef.current.click();
        } else {
            try {
                setLoading(true);
                await updateAvatar({ avatarUrl: "", avatarFileId: 0 }).unwrap();
            } catch (error) {
                console.error("Update failed ", error);
            }
            setLoading(false);
        }
    };
    console.log({ user: `${UPLOADS_BASE_URL}/${user.avatarFileId}` });
    return (
        <Box>
            <Box px={2.5} borderBottom="0.5px solid #C9C9CA">
                <Box display="flex" height="80px" justifyContent="space-between">
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            width: "100%",
                        }}
                    >
                        <IconButton onClick={onClose}>
                            <ArrowBackIos />
                        </IconButton>
                        <Typography variant="h6">Settings</Typography>
                    </Stack>
                </Box>
            </Box>
            <Stack
                spacing={2}
                alignItems="center"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    marginTop: "2em",
                }}
            >
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Box sx={{ position: "relative" }}>
                        <Avatar
                            alt={user.displayName}
                            src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
                            sx={{ width: 100, height: 100 }}
                        />
                        <IconButton
                            color="primary"
                            sx={{ position: "absolute", bottom: "0", right: "0" }}
                            size="large"
                            onClick={() => setEditingProfilePicture(true)}
                        >
                            <CameraAlt />
                        </IconButton>
                        <input
                            ref={imageRef}
                            type="file"
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </Box>
                )}
                <Link variant="h6" underline="none">
                    {user.displayName}
                </Link>
            </Stack>

            <Box p={2} mt={2}>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={() => setEditingPersonalInfo(true)}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        cursor: "pointer",
                    }}
                >
                    <Box component="span">Personal information</Box>
                    <ChevronRight />
                </Stack>

                {localStorage.getItem(Constants.LSKEY_DISABLEPUSHALER) && (
                    <>
                        <Link
                            component="button"
                            align="left"
                            fontWeight="bold"
                            variant="h6"
                            underline="none"
                            onClick={() => {
                                localStorage.removeItem(Constants.LSKEY_DISABLEPUSHALER);
                                location.reload();
                            }}
                        >
                            Enable desktop notification
                        </Link>
                        <br />
                    </>
                )}
                <Link
                    component="button"
                    align="left"
                    fontWeight="bold"
                    variant="h6"
                    underline="none"
                    onClick={() => {
                        window.localStorage.removeItem(Constants.LSKEY_ACCESSTOKEN);
                        window.localStorage.removeItem(Constants.LSKEY_DEVICEID);
                        navigate("/");
                    }}
                >
                    Logout
                </Link>
            </Box>
            {editingProfilePicture && (
                <EditPhotoDialog
                    open={editingProfilePicture}
                    onClose={() => setEditingProfilePicture(false)}
                    onConfirm={selectedEditAction}
                />
            )}

            {editingPersonalInfo && (
                <EditPersonalInfoDialog onClose={() => setEditingPersonalInfo(false)} user={user} />
            )}
        </Box>
    );
}

export interface EditPhotoDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
}

export function EditPhotoDialog(props: EditPhotoDialogProps) {
    const { onClose, open, onConfirm } = props;
    const [value, setValue] = React.useState("upload");
    const handleClose = () => {
        onClose();
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
    };
    const handleSelection = () => {
        onConfirm(value);
    };

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle sx={{ textAlign: "center" }}>Photo</DialogTitle>
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    // width: "100%",
                    margin: "0",
                    padding: "5px",
                    position: "absolute",
                    right: "10px",
                    top: "12px",
                }}
                onClick={(e) => {
                    handleClose();
                }}
            >
                <Close />
            </IconButton>
            <Box sx={{ width: "300px", margin: "2em" }}>
                <FormControl>
                    <RadioGroup
                        aria-labelledby="photo-radio-buttons-group-label"
                        name="radio-buttons-group"
                        value={value}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="upload" control={<Radio />} label="Upload photo" />
                        <FormControlLabel value="remove" control={<Radio />} label="Remove photo" />
                    </RadioGroup>
                </FormControl>
            </Box>
            <Button
                variant="contained"
                size="medium"
                sx={{ margin: 2 }}
                onClick={() => {
                    handleSelection();
                    handleClose();
                }}
            >
                Confirm
            </Button>
        </Dialog>
    );
}
