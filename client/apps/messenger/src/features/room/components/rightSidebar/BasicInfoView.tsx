import { CameraAlt } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as Constants from "../../../../../../../lib/constants";
import countries from "../../../../../../../lib/countries";
import useStrings from "../../../../hooks/useStrings";
import { selectUser } from "../../../../store/userSlice";
import { RoomType } from "../../../../types/Rooms";
import UserType from "../../../../types/User";
import { crop } from "../../../../utils/crop";
import uploadFile from "../../../../utils/uploadFile";
import { useUpdateRoomMutation } from "../../api/room";
import { refreshOne as refreshOneRoom } from "../../slices/leftSidebar";
import { EditPhotoDialog } from "../EditProfile";

declare const UPLOADS_BASE_URL: string;

export interface DetailsBasicInfoProps {
    roomData: RoomType;
}

export function DetailsBasicInfoView(props: DetailsBasicInfoProps) {
    const { roomData } = props;
    const dispatch = useDispatch();
    const isItPrivateGroup = roomData.type === "private";
    const otherUser = roomData.users[1];
    const [editGroupPicture, setEditGroupPicture] = useState(false);
    const [editGroupName, setEditGroupName] = useState(false);
    const [profileAvatarUrl, setProfileAvatarUrl] = useState(roomData.avatarUrl);
    const [profileAvatarFileId, setProfileAvatarFileId] = useState(roomData.avatarFileId);
    const [proposedName, setProposedName] = useState(roomData.name);
    const [name, setName] = useState(roomData.name);
    const imageRef = useRef(null);
    const [file, setFile] = useState<File>();
    const [loading, setLoading] = useState(false);
    const [update] = useUpdateRoomMutation();
    const me = useSelector(selectUser);
    let amIAdmin = false;

    useEffect(() => {
        if (roomData) {
            setProfileAvatarUrl(roomData.avatarUrl);
            setProfileAvatarFileId(roomData.avatarFileId);
            setProposedName(roomData.name);
            setName(roomData.name);
        }
    }, [roomData]);

    roomData.users
        .filter((person) => person.userId == me.id)
        .map((filteredPerson) => (amIAdmin = filteredPerson.isAdmin));

    const openEditPicture = () => {
        setEditGroupPicture(true);
    };
    const closeEditPicture = () => {
        setEditGroupPicture(false);
    };

    const openEditName = () => {
        setEditGroupName(true);
    };
    const closeEditName = () => {
        setEditGroupName(false);
    };

    const showOpenFileDialog = () => {
        imageRef.current.click();
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProposedName(event.target.value);
    };

    const selectedEditAction = (editAction: string) => {
        if (editAction === "upload") {
            showOpenFileDialog();
        } else {
            removeProfilePhoto();
        }
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

    const removeProfilePhoto = async () => {
        try {
            setLoading(true);
            const { room } = await update({
                roomId: roomData.id,
                data: { name: proposedName, avatarUrl: "", avatarFileId: 0 },
            }).unwrap();

            dispatch(refreshOneRoom(room));

            setProfileAvatarUrl("");
            setProfileAvatarFileId(0);
            setLoading(false);
            closeEditName();
        } catch (error) {
            setLoading(false);

            console.error("Update failed ", error);
        }
    };

    const handleUpdateGroup = async () => {
        try {
            setLoading(true);

            let updatedRoom: RoomType | null = null;

            if (file) {
                const uploadedFile = await uploadFile({
                    file,
                    type: "avatar",
                    relationId: roomData.id,
                });

                const { room } = await update({
                    roomId: roomData.id,
                    data: {
                        name: proposedName,
                        avatarUrl: uploadedFile.path,
                        avatarFileId: uploadedFile.id,
                    },
                }).unwrap();

                updatedRoom = room;

                setProfileAvatarUrl(uploadedFile.path);
                setProfileAvatarFileId(uploadedFile.id);
            } else {
                const { room } = await update({
                    roomId: roomData.id,
                    data: { name: proposedName },
                }).unwrap();

                updatedRoom = room;
            }

            dispatch(refreshOneRoom(updatedRoom));

            setName(proposedName);
            setLoading(false);
            closeEditName();
        } catch (error) {
            setLoading(false);

            console.error("Update failed ", error);
        }
    };

    useEffect(() => {
        if (file) {
            handleUpdateGroup();
        }
    }, [file]);

    return (
        <Box>
            <Stack
                direction="column"
                alignItems="center"
                spacing={1}
                pt={2}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {isItPrivateGroup ? (
                    <Avatar
                        alt={otherUser.user.displayName}
                        src={`${UPLOADS_BASE_URL}/${otherUser.user.avatarFileId}`}
                        sx={{ width: 100, height: 100 }}
                    />
                ) : (
                    <Box sx={{ position: "relative" }}>
                        <Avatar
                            alt={profileAvatarUrl}
                            src={`${UPLOADS_BASE_URL}/${profileAvatarFileId}`}
                            sx={{ width: 100, height: 100 }}
                        />
                        <>
                            {amIAdmin ? (
                                <Box>
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
                            ) : null}
                        </>
                    </Box>
                )}
                {isItPrivateGroup ? (
                    <Typography variant="h6">{otherUser.user.displayName}</Typography>
                ) : (
                    <>
                        {editGroupName ? (
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
                                        label="User name"
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
                                                    handleUpdateGroup();
                                                }
                                            }}
                                        >
                                            Save
                                        </Button>
                                    )}
                                </Stack>
                            </Box>
                        ) : (
                            <>
                                {amIAdmin ? (
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
                                ) : (
                                    <Typography variant="h6">{name}</Typography>
                                )}
                            </>
                        )}
                    </>
                )}
            </Stack>
            {editGroupPicture ? (
                <EditPhotoDialog
                    open={editGroupPicture}
                    onClose={closeEditPicture}
                    onConfirm={selectedEditAction}
                />
            ) : null}

            {isItPrivateGroup && <PersonalInfo user={otherUser.user} />}
        </Box>
    );
}

function PersonalInfo({ user }: { user: UserType }) {
    const strings = useStrings("en");
    return (
        <Stack px={1.5} my={4} spacing={1}>
            <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                <Typography color="text.tertiary" fontSize="0.75rem">
                    {strings.dob}
                </Typography>
                <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                    {user.dob ? dayjs(user.dob).format("DD/MM/YYYY") : ""}
                </Typography>
            </Box>
            <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                <Typography color="text.tertiary" fontSize="0.75rem">
                    {strings.email}
                </Typography>
                <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                    {user.emailAddress}
                </Typography>
            </Box>
            <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                <Typography color="text.tertiary" fontSize="0.75rem">
                    {strings.country}
                </Typography>
                <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                    {countries.find((c) => c.code === user.country)?.label || ""}
                </Typography>
            </Box>
            <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                <Typography color="text.tertiary" fontSize="0.75rem">
                    {strings.city}
                </Typography>
                <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                    {user.city}
                </Typography>
            </Box>
        </Stack>
    );
}
