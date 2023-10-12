import React, { useState, useRef, useEffect, useContext } from "react";
import Avatar from "@mui/material/Avatar";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import CameraAlt from "@mui/icons-material/CameraAlt";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Close from "@mui/icons-material/Close";

import { useLogoutMutation, useRemoveMutation, useUpdateMutation } from "../../auth/api/auth";

import { crop } from "../../../utils/crop";

import * as Constants from "../../../../../../lib/constants";

import ThemeSwitch from "./leftSidebar/ThemeSwitch";
import { ThemeContext, ThemeType } from "../../../theme";
import useStrings from "../../../hooks/useStrings";
import { ContactRow } from "./leftSidebar/ContactList";
import { useGetBlockedUsersQuery, useRemoveUserFromBlockListMutation } from "../api/user";
import getFileType from "../lib/getFileType";
import FileUploader from "../../../utils/FileUploader";
import setupPushNotification from "../../../components/firebaseInit";
import { useUpdateDeviceMutation } from "../../../api/device";
import LogoutIcon from "@mui/icons-material/Logout";
import { useShowBasicDialog } from "../../../hooks/useModal";
import { useAppDispatch } from "../../../hooks";

declare const UPLOADS_BASE_URL: string;

export interface EditProfileProps {
    onClose: () => void;
    user: any;
}

export function EditProfileView({ onClose, user }: EditProfileProps) {
    const strings = useStrings();
    const imageRef = useRef(null);
    const [name, setName] = useState(user.displayName);
    const [proposedName, setProposedName] = useState(user.displayName || "");
    const [file, setFile] = useState<File>();
    const [editProfileName, setEditProfileName] = useState(false);
    const [editProfilePicture, setEditProfilePicture] = useState(false);
    const [editingBlockedList, setEditingBlockedList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pushNotificationsAllowed, setPushNotificationsAllowed] = useState(true);
    const [update] = useUpdateMutation();
    const [logout] = useLogoutMutation();
    const { theme, setTheme } = useContext(ThemeContext);
    const dispatch = useAppDispatch();
    const [updateDevice] = useUpdateDeviceMutation();
    const [remove] = useRemoveMutation();
    const showBasicDialog = useShowBasicDialog();

    useEffect(() => {
        if (window.Notification && Notification.permission !== "granted") {
            setPushNotificationsAllowed(false);
        }
    }, []);

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
            Constants.LSKEY_CROPSIZE,
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
        const displayName = proposedName.trim() ? proposedName.trim() : undefined;

        try {
            setLoading(true);
            closeEditName();
            await update({ displayName, avatarFileId: 0 }).unwrap();
            setLoading(false);
            setProposedName(displayName || user.displayName);
        } catch (error) {
            setLoading(false);

            console.error("Update failed ", error);
        }
    };

    const handleUpdateUser = async () => {
        try {
            setLoading(true);
            const displayName = proposedName.trim() ? proposedName.trim() : user.displayName;

            if (file) {
                const type = getFileType(file.type);
                const fileUploader = new FileUploader({
                    file,
                    type,
                });

                const uploadedFile = await fileUploader.upload();

                await update({
                    displayName,
                    avatarFileId: uploadedFile.id,
                }).unwrap();
            } else {
                await update({
                    displayName,
                    avatarFileId: user.avatarFileId,
                }).unwrap();
            }

            setName(displayName);
            setProposedName(displayName);
            setLoading(false);
            closeEditName();
        } catch (error) {
            setLoading(false);

            console.error("Update failed ", error);
        }
    };

    const handleLogout = async () => {
        await logout(null).unwrap();
        window.localStorage.removeItem(Constants.LSKEY_ACCESSTOKEN);
        window.localStorage.removeItem(Constants.LSKEY_DEVICEID);

        dispatch({ type: "USER_LOGOUT" });
        window.location.href = "/messenger/";
    };

    const handleDelete = async () => {
        showBasicDialog(
            {
                allowButtonLabel: strings.yes,
                denyButtonLabel: strings.cancel,
                text: strings.deleteUserDescription,
                title: strings.deleteUserQuestion,
            },
            () => {
                remove(null)
                    .unwrap()
                    .then(() => {
                        window.localStorage.removeItem(Constants.LSKEY_ACCESSTOKEN);
                        window.localStorage.removeItem(Constants.LSKEY_DEVICEID);

                        dispatch({ type: "USER_LOGOUT" });
                        window.location.href = "/messenger/";
                    });
            },
        );
    };

    const handleAllowNotifications = async () => {
        const permission = await window.Notification?.requestPermission();
        if (permission === "granted") {
            const pushToken = await setupPushNotification();

            if (pushToken && pushToken.length > 0) {
                await updateDevice({ pushToken }).unwrap();
                setPushNotificationsAllowed(true);
            }
        }
    };

    if (editingBlockedList) {
        return (
            <Box>
                <Box px={2.5} borderBottom="0.5px solid" borderColor="divider">
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
                                onClick={() => setEditingBlockedList(false)}
                                style={{ borderRadius: "10px" }}
                            >
                                <ArrowBackIos
                                    sx={{ color: "primary.main", position: "relative", left: 3 }}
                                />
                            </IconButton>
                            <Typography variant="h6">{strings.blockedUsers}</Typography>
                        </Stack>
                    </Box>
                </Box>
                <BlockedUsersList />
            </Box>
        );
    }

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
                            style={{ borderRadius: "10px" }}
                        >
                            <ArrowBackIos
                                sx={{ color: "primary.main", position: "relative", left: 3 }}
                            />
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
                            src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
                            sx={{ width: 100, height: 100 }}
                        />
                        <IconButton
                            color="primary"
                            sx={{
                                position: "absolute",
                                bottom: "0",
                                right: "0",
                                backgroundColor: "#E5F4FF",
                                width: "28px",
                                height: "28px",
                                "&:hover": {
                                    backgroundColor: "#E5F4FF",
                                },
                            }}
                            onClick={(e) => {
                                openEditPicture();
                            }}
                        >
                            <CameraAlt sx={{ width: "15px" }} />
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
                            width: "100%",
                            p: "0 16px",
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
                                sx={{ width: "100%" }}
                                value={proposedName}
                                onChange={handleNameChange}
                            />
                            {loading ? (
                                <CircularProgress />
                            ) : (
                                <Button
                                    variant="contained"
                                    disabled={proposedName.trim().length === 0}
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

            <Box display="grid" gap={1} p={2} mt={2}>
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

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={() => setEditingBlockedList(true)}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        cursor: "pointer",
                    }}
                >
                    <Box component="span">{strings.blockedUsers}</Box>
                    <ChevronRight />
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    component="a"
                    href={Constants.TERMS_AND_CONDITIONS_URL}
                    target="_blank"
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        cursor: "pointer",
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <Box component="span">{strings.termsAndConditions}</Box>
                    <ChevronRight />
                </Stack>

                {!pushNotificationsAllowed && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={handleAllowNotifications}
                        sx={{
                            height: "40px",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            cursor: "pointer",
                        }}
                    >
                        <Box component="span">{strings.enableDesktopNotifications}</Box>
                        <ChevronRight />
                    </Stack>
                )}

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={handleDelete}
                    color="error.main"
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        cursor: "pointer",
                    }}
                >
                    <Box component="span">{strings.deleteMyAccount}</Box>
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={handleLogout}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        cursor: "pointer",
                    }}
                >
                    <Box component="span">{strings.logout}</Box>
                    <LogoutIcon />
                </Stack>
            </Box>
            {editProfilePicture ? (
                <EditPhotoDialog
                    open={editProfilePicture}
                    onClose={closeEditPicture}
                    onConfirm={selectedEditAction}
                    havePhoto={user.avatarFileId > 0}
                />
            ) : null}
        </Box>
    );
}

export interface EditPhotoDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    havePhoto: boolean;
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
        <Dialog
            maxWidth="xs"
            sx={{ "& .MuiDialog-paper": { width: "100%" } }}
            onClose={handleClose}
            open={open}
        >
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
                            disabled={!props.havePhoto}
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

function BlockedUsersList() {
    const { data: blockedUsers, isLoading } = useGetBlockedUsersQuery();
    const [remove] = useRemoveUserFromBlockListMutation();
    const strings = useStrings();

    if (isLoading) {
        return null;
    }

    if (!blockedUsers.length) {
        return (
            <Box mt={3} px={2.5}>
                {strings.noBlockedUsers}
            </Box>
        );
    }

    return (
        <Stack mt={3}>
            {blockedUsers.map((user) => {
                return (
                    <Box
                        key={user.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        pr={2.5}
                    >
                        <ContactRow
                            name={user.displayName}
                            selected={false}
                            avatarFileId={user.avatarFileId}
                        />
                        <IconButton
                            onClick={() => remove(user.id)}
                            style={{ borderRadius: "10px" }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                );
            })}
        </Stack>
    );
}
