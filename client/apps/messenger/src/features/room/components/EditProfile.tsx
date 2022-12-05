import React, { useState, useRef } from "react";
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
import useStrings from "../../../hooks/useStrings";
import { useGetBlockedUsersQuery, useRemoveUserFromBlockListMutation } from "../api/user";
import { ContactRow } from "./leftSidebar/ContactList";

declare const UPLOADS_BASE_URL: string;

export interface EditProfileProps {
    onClose: () => void;
    user: any;
}

export function EditProfileView({ onClose, user }: EditProfileProps) {
    const strings = useStrings();
    const imageRef = useRef(null);
    const [editingProfilePicture, setEditingProfilePicture] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
    const [editingBlockedList, setEditingBlockedList] = useState(false);
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

    if (editingBlockedList) {
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
                            <IconButton onClick={() => setEditingBlockedList(false)}>
                                <ArrowBackIos />
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
                    <Box component="span">{strings.personalInformation}</Box>
                    <ChevronRight />
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
            <DialogTitle sx={{ textAlign: "center" }}>{strings.photo}</DialogTitle>
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
                onClick={handleClose}
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

function BlockedUsersList() {
    const { data: blockedUsers, isLoading } = useGetBlockedUsersQuery();
    const [remove] = useRemoveUserFromBlockListMutation();

    if (isLoading) {
        return null;
    }

    console.log({ blockedUsers });
    if (!blockedUsers.length) {
        return <Box px={2.5}>No blocked users</Box>;
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
                        <IconButton onClick={() => remove(user.id)}>
                            <Close />
                        </IconButton>
                    </Box>
                );
            })}
        </Stack>
    );
}
