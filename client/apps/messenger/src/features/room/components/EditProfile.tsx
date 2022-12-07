import React, { useState, useRef, useEffect, useContext } from "react";
import {
    Avatar,
    Box,
    IconButton,
    Typography,
    Stack,
    Link,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    CircularProgress,
} from "@mui/material";
import { ArrowBackIos, CameraAlt, Close } from "@mui/icons-material";
import uploadFile from "../../../utils/uploadFile";

import { useUpdateMutation } from "../../auth/api/auth";

import { crop } from "../../../utils/crop";

import * as Constants from "../../../../../../lib/constants";
import { useNavigate } from "react-router-dom";

import ThemeSwitch from "./leftSidebar/ThemeSwitch";
import { ThemeContext, ThemeType } from "../../../theme";
import useStrings from "../../../hooks/useStrings";

declare const UPLOADS_BASE_URL: string;

export interface EditProfileProps {
    onClose: () => void;
    user: any;
}

export function EditProfileView({ onClose, user }: EditProfileProps) {
    const strings = useStrings();
    const imageRef = useRef(null);
    const [name, setName] = React.useState(user.displayName);
    const [proposedName, setProposedName] = React.useState(user.displayName);
    const [profileAvatarFileId, setProfileAvatarFileId] = React.useState(user.avatarFileId);
    const [file, setFile] = useState<File>();
    const [editProfileName, setEditProfileName] = useState(false);
    const [editProfilePicture, setEditProfilePicture] = useState(false);
    const [loading, setLoading] = useState(false);
    const [update] = useUpdateMutation();
    const navigate = useNavigate();
    const { theme, setTheme } = useContext(ThemeContext);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProposedName(event.target.value);
    };

    const closeEditor = () => {
        onClose();
    };

    const showOpenFileDialog = () => {
        imageRef.current.click();
    };

    const openEditName = () => {
        setEditProfileName(true);
    };
    const closeEditName = () => {
        setEditProfileName(false);
    };

    const openEditPicture = () => {
        setEditProfilePicture(true);
    };
    const closeEditPicture = () => {
        setEditProfilePicture(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];
        const objectUrl = URL.createObjectURL(uploadedFile);
        cropAndResizeSelectedFile(objectUrl);
    };

    const cropAndResizeSelectedFile = async (selectedFileUrl: string) => {
        const croppedImage = await crop(
            selectedFileUrl,
            1,
            Constants.LSKEY_CROPSIZE,
            Constants.LSKEY_CROPSIZE
        );
        const file = new File([croppedImage], "image.png");
        setFile(file);
    };

    useEffect(() => {
        if (file) {
            handleUpdateUser();
        }
    }, [file]);

    const selectedEditAction = (editAction: string) => {
        if (editAction === "upload") {
            showOpenFileDialog();
        } else {
            removeProfilePhoto();
        }
    };

    const removeProfilePhoto = async () => {
        try {
            setLoading(true);
            await update({ displayName: proposedName, avatarUrl: "", avatarFileId: 0 }).unwrap();
            setLoading(false);
            closeEditName();
        } catch (error) {
            setLoading(false);

            console.error("Update failed ", error);
        }
    };

    const handleUpdateUser = async () => {
        try {
            setLoading(true);

            if (file) {
                const uploadedFile = await uploadFile({
                    file,
                    type: "avatar",
                    relationId: user.id,
                });

                await update({
                    displayName: proposedName,
                    avatarUrl: uploadedFile.path,
                    avatarFileId: uploadedFile.id,
                }).unwrap();
                setProfileAvatarFileId(uploadedFile.id);
            } else {
                await update({ displayName: proposedName }).unwrap();
            }

            setName(proposedName);
            setLoading(false);
            closeEditName();
        } catch (error) {
            setLoading(false);

            console.error("Update failed ", error);
        }
    };

    return (
        <Box>
            <Box px={2.5} borderBottom="0.5px solid" sx={{ borderColor: "divider" }}>
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
                        <IconButton
                            onClick={(e) => {
                                closeEditor();
                            }}
                        >
                            <ArrowBackIos />
                        </IconButton>
                        <Typography variant="h6">{strings.settings}</Typography>
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
                            src={`${UPLOADS_BASE_URL}/${profileAvatarFileId}`}
                            sx={{ width: 100, height: 100 }}
                        />
                        <IconButton
                            color="primary"
                            sx={{ position: "absolute", bottom: "0", right: "0" }}
                            size="large"
                            onClick={(e) => {
                                openEditPicture();
                            }}
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

                {editProfileName ? (
                    <Box
                        sx={{
                            width: "90%",
                            margin: "2em",
                        }}
                    >
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
                            <TextField
                                id="outlined-basic"
                                label={strings.username}
                                variant="outlined"
                                sx={{ width: "70%" }}
                                value={proposedName}
                                onChange={handleNameChange}
                            />
                            {loading ? (
                                <CircularProgress />
                            ) : (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                        if (name.length > 0) {
                                            handleUpdateUser();
                                        }
                                    }}
                                >
                                    {strings.save}
                                </Button>
                            )}
                        </Stack>
                    </Box>
                ) : (
                    <Link
                        component="button"
                        variant="h6"
                        underline="none"
                        onClick={() => {
                            openEditName();
                        }}
                    >
                        {name}
                    </Link>
                )}
            </Stack>

            <Box p={2} mt={2}>
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
                            {strings.enableDesktopNotifications}
                        </Link>
                        <br />
                    </>
                )}
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    {strings.colorSchema}
                    <ThemeSwitch
                        checked={theme === "dark"}
                        onChange={(e) => {
                            const mode: ThemeType = e.target.checked ? "dark" : "light";
                            setTheme(mode);
                            window.localStorage.setItem(Constants.LSKEY_THEME, mode);
                        }}
                    />
                </Stack>

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
                    {strings.logout}
                </Link>
            </Box>
            {editProfilePicture ? (
                <EditPhotoDialog
                    open={editProfilePicture}
                    onClose={closeEditPicture}
                    onConfirm={selectedEditAction}
                />
            ) : null}
        </Box>
    );
}

export interface EditPhotoDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
}

export function EditPhotoDialog(props: EditPhotoDialogProps) {
    const strings = useStrings();
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
                        <FormControlLabel
                            value="upload"
                            control={<Radio />}
                            label={strings.uploadPhoto}
                        />
                        <FormControlLabel
                            value="remove"
                            control={<Radio />}
                            label={strings.removePhoto}
                        />
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
                {strings.confirm}
            </Button>
        </Dialog>
    );
}
