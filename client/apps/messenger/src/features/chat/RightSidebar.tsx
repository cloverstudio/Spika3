import React, { useRef, useState, useEffect } from "react";
import {
    Box,
    Stack,
    IconButton,
    Typography,
    Avatar,
    Switch,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    TextField,
    CircularProgress,
    Button,
    Link,
} from "@mui/material";
import {
    Close,
    ChevronRight,
    Add,
    ExitToApp,
    WarningAmber,
    DoDisturb,
    CameraAlt,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { hide as hideRightSidebar } from "./slice/rightSidebarSlice";
import { useParams } from "react-router-dom";
import { useGetRoomQuery } from "./api/room";
import { RoomType, RoomUserType } from "../../types/Rooms";
import { selectUser } from "../../store/userSlice";
import { crop } from "../../utils/crop";
import * as Constants from "../../../../../lib/constants";
import uploadFile from "../../utils/uploadFile";
import { EditPhotoDialog } from "../chat/components/EditProfile";
import { useUpdateRoomMutation } from "../chat/api/room";

declare const UPLOADS_BASE_URL: string;

export default function RightSidebar(): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = +useParams().id;
    const { data, isLoading } = useGetRoomQuery(roomId);
    const otherUser = data.room.users[1];
    const isItPrivate = data.room.type === "private";

    const handleDetailActions = (action: string) => {};

    return (
        <Box borderLeft="0.5px solid #C9C9CA" padding="0" margin="0">
            <Box height="80.5px" borderBottom="0.5px solid #C9C9CA">
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "left",
                        paddingTop: "15px",
                    }}
                >
                    <IconButton
                        size="large"
                        onClick={(e) => {
                            dispatch(hideRightSidebar());
                        }}
                    >
                        <Close />
                    </IconButton>
                    {isItPrivate ? (
                        <Typography variant="h6">Chat details</Typography>
                    ) : (
                        <Typography variant="h6">Group details</Typography>
                    )}
                </Stack>
            </Box>
            <DetailsBasicInfoView roomData={data.room} />
            <DetailsAdditionalInfoView selectedInfo={handleDetailActions} />
            {!isItPrivate ? <DetailsMemberView members={data.room.users} /> : null}
            <DetailsDestructiveActionsView isItPrivateChat={isItPrivate} otherUser={otherUser} />
        </Box>
    );
}

export interface DetailsBasicInfoProps {
    roomData: RoomType;
}

export function DetailsBasicInfoView(props: DetailsBasicInfoProps) {
    const { roomData } = props;
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
            await update({ roomId: roomData.id, name: proposedName, avatarUrl: "" }).unwrap();
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

            if (file) {
                const uploadedFile = await uploadFile({
                    file,
                    type: "avatar",
                    relationId: roomData.id,
                });

                await update({
                    roomId: roomData.id,
                    name: proposedName,
                    avatarUrl: uploadedFile.path,
                }).unwrap();
                setProfileAvatarUrl(uploadedFile.path);
            } else {
                await update({ roomId: roomData.id, name: proposedName }).unwrap();
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
        handleUpdateGroup();
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

export interface DetailsAdditionalInfoProps {
    selectedInfo: Function;
}

export function DetailsAdditionalInfoView(props: DetailsAdditionalInfoProps) {
    const { selectedInfo } = props;

    const handleSelection = (action: String) => {
        selectedInfo(action);
    };

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
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                        margin: "0",
                    }}
                    onClick={(e) => {
                        handleSelection("shared");
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <Typography variant="subtitle1">Shared Media, Links and Docs</Typography>
                        <ChevronRight />
                    </Stack>
                </IconButton>
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                        paddingTop: "0",
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <Typography variant="subtitle1">Call history</Typography>
                        <ChevronRight />
                    </Stack>
                </IconButton>
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                    onClick={(e) => {
                        handleSelection("callHistory");
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <Typography variant="subtitle1">Notes</Typography>
                        <ChevronRight />
                    </Stack>
                </IconButton>
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                        paddingTop: "0",
                        paddingBottom: "12px",
                    }}
                    onClick={(e) => {
                        handleSelection("notes");
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <Typography variant="subtitle1">Favorite messages</Typography>
                        <ChevronRight />
                    </Stack>
                </IconButton>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "0px 12px",
                    }}
                    onClick={(e) => {
                        handleSelection("favoriteMessages");
                    }}
                >
                    <Typography variant="subtitle1">Pin chat</Typography>
                    <Switch />
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "0px 12px 12px 12px",
                    }}
                >
                    <Typography variant="subtitle1">Mute notifications</Typography>
                    <Switch />
                </Stack>
            </Stack>
        </Box>
    );
}

export interface DetailsMembersProps {
    members: RoomUserType[];
}

export function DetailsMemberView(props: DetailsMembersProps) {
    const { members } = props;
    const me = useSelector(selectUser);
    var amIAdmin: boolean = false;

    members
        .filter((person) => person.userId == me.id)
        .map((filteredPerson) => (amIAdmin = filteredPerson.isAdmin));

    var membersArray: RoomUserType[] = [];

    if (members.length > 4) {
        membersArray = members.slice(0, 4);
    } else {
        membersArray = members;
    }
    return (
        <Box padding="12px">
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <Typography variant="h6"> {members.length} Members</Typography>
                <IconButton size="large" color="primary">
                    <Add />
                </IconButton>
            </Stack>
            <List
                dense
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                    paddingLeft: "0",
                }}
            >
                {members.map((value) => {
                    return (
                        <ListItem
                            key={value.user.id}
                            secondaryAction={
                                value.isAdmin ? (
                                    <Typography>Admin</Typography>
                                ) : amIAdmin ? (
                                    <IconButton size="large" color="primary" onClick={(e) => {}}>
                                        <Close />
                                    </IconButton>
                                ) : null
                            }
                            disablePadding={true}
                        >
                            <ListItemButton sx={{ paddingLeft: "0", paddingRight: "0" }}>
                                <ListItemAvatar>
                                    <Avatar
                                        alt={value.user.displayName}
                                        src={value.user.avatarUrl}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    id={value.user.displayName}
                                    primary={value.user.displayName}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <IconButton
                disableRipple
                size="large"
                color="primary"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    width: "100%",
                    margin: "0",
                    padding: "0",
                }}
            >
                <Typography variant="subtitle1">Show more</Typography>
            </IconButton>
        </Box>
    );
}

export interface DetailsDestructiveActionsProps {
    isItPrivateChat: boolean;
    otherUser: RoomUserType;
}

export function DetailsDestructiveActionsView(props: DetailsDestructiveActionsProps) {
    const { isItPrivateChat, otherUser } = props;

    return (
        <Box>
            {isItPrivateChat ? (
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
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
                        <DoDisturb style={{ fill: "red" }} />
                        <Typography variant="subtitle1" color="red">
                            Block {otherUser.user.displayName}
                        </Typography>
                    </Stack>
                </IconButton>
            ) : null}
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    width: "100%",
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
                    <WarningAmber style={{ fill: "red" }} />
                    {isItPrivateChat ? (
                        <Typography variant="subtitle1" color="red">
                            Report {otherUser.user.displayName}
                        </Typography>
                    ) : (
                        <Typography variant="subtitle1" color="red">
                            Report group
                        </Typography>
                    )}
                </Stack>
            </IconButton>
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    width: "100%",
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
                    <ExitToApp style={{ fill: "red" }} />
                    {isItPrivateChat ? (
                        <Typography variant="subtitle1" color="red">
                            Leave conversation
                        </Typography>
                    ) : (
                        <Typography variant="subtitle1" color="red">
                            Exit group
                        </Typography>
                    )}
                </Stack>
            </IconButton>
        </Box>
    );
}
