import React, { useRef, useState, useEffect } from "react";
import {
    Box,
    Stack,
    IconButton,
    Typography,
    Avatar,
    TextField,
    CircularProgress,
    Button,
    Link,
} from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RoomType } from "../../../../types/Rooms";
import { selectUser } from "../../../../store/userSlice";
import { crop } from "../../../../utils/crop";
import * as Constants from "../../../../../../../lib/constants";
import uploadFile from "../../../../utils/uploadFile";
import { EditPhotoDialog } from "../../../chat/components/EditProfile";
import { useUpdateRoomMutation } from "../../../chat/api/room";
import { refreshOne as refreshOneRoom } from "../../../chat/slice/roomSlice";

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
    const [profileAvatarUrl, setProfileAvatarUrl] = isItPrivateGroup
        ? React.useState("")
        : React.useState(roomData.avatarUrl);
    const [proposedName, setProposedName] = isItPrivateGroup
        ? React.useState("")
        : React.useState(roomData.name);
    const [name, setName] = isItPrivateGroup ? React.useState("") : React.useState(roomData.name);
    const imageRef = useRef(null);
    const [file, setFile] = useState<File>();
    const [loading, setLoading] = useState(false);
    const [update, updateMutation] = useUpdateRoomMutation();
    const me = useSelector(selectUser);
    var amIAdmin: boolean = false;

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
        let croppedImage = await crop(
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
                data: { name: proposedName, avatarUrl: "" },
            }).unwrap();

            dispatch(refreshOneRoom(room));

            setProfileAvatarUrl("");
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
                    data: { name: proposedName, avatarUrl: uploadedFile.path },
                }).unwrap();

                updatedRoom = room;

                setProfileAvatarUrl(uploadedFile.path);
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
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingTop: "15px",
                }}
            >
                {isItPrivateGroup ? (
                    <Avatar alt={otherUser.user.displayName} src={otherUser.user.avatarUrl} />
                ) : (
                    <Box sx={{ position: "relative" }}>
                        <Avatar
                            alt={profileAvatarUrl}
                            src={`${UPLOADS_BASE_URL}${profileAvatarUrl}`}
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
        </Box>
    );
}
