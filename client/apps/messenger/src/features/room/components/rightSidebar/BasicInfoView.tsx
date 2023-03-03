import React, { useEffect, useRef, useState } from "react";

import Avatar from "@mui/material/Avatar";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CameraAlt from "@mui/icons-material/CameraAlt";
import { useSelector } from "react-redux";

import * as Constants from "../../../../../../../lib/constants";
import useStrings from "../../../../hooks/useStrings";
import { selectUser } from "../../../../store/userSlice";
import { RoomType } from "../../../../types/Rooms";
import { crop } from "../../../../utils/crop";
import { useUpdateRoomMutation } from "../../api/room";
import { selectOtherUserIdInPrivateRoom } from "../../slices/messages";
import { EditPhotoDialog } from "../EditProfile";
import getFileType from "../../lib/getFileType";
import FileUploader from "../../../../utils/FileUploader";

declare const UPLOADS_BASE_URL: string;

export interface DetailsBasicInfoProps {
    roomData: RoomType;
}

export function DetailsBasicInfoView(props: DetailsBasicInfoProps) {
    const strings = useStrings();
    const { roomData } = props;
    const isItPrivateGroup = roomData.type === "private";
    const otherUserId = useSelector(selectOtherUserIdInPrivateRoom(roomData.id));
    const [editGroupPicture, setEditGroupPicture] = useState(false);
    const [editGroupName, setEditGroupName] = useState(false);
    const [proposedName, setProposedName] = useState(roomData.name);
    const [name, setName] = useState(roomData.name);
    const imageRef = useRef(null);
    const [file, setFile] = useState<File>();
    const [loading, setLoading] = useState(false);
    const [update] = useUpdateRoomMutation();
    const me = useSelector(selectUser);
    let amIAdmin = false;

    const otherUser = roomData.users.find((u) => u.userId === otherUserId)?.user;

    useEffect(() => {
        if (roomData) {
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
            await update({
                roomId: roomData.id,
                data: { name: proposedName, avatarFileId: 0 },
            }).unwrap();

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

            if (file) {
                const type = getFileType(file.type);
                const fileUploader = new FileUploader({
                    file,
                    type,
                });

                const uploadedFile = await fileUploader.upload();

                await update({
                    roomId: roomData.id,
                    data: {
                        name: proposedName,
                        avatarFileId: uploadedFile.id,
                    },
                }).unwrap();
            } else {
                await update({
                    roomId: roomData.id,
                    data: { name: proposedName },
                }).unwrap();
            }

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
                spacing={3}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {isItPrivateGroup ? (
                    <Avatar
                        alt={otherUser.displayName}
                        src={`${UPLOADS_BASE_URL}/${otherUser.avatarFileId}`}
                    />
                ) : (
                    <Box sx={{ position: "relative" }}>
                        <Avatar
                            src={`${UPLOADS_BASE_URL}/${roomData.avatarFileId}`}
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
                    <Typography variant="h6">{otherUser.displayName}</Typography>
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
                                            {strings.save}
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
