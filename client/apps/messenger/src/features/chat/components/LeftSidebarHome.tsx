import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Avatar,
    Box,
    SvgIconTypeMap,
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

import {
    Settings,
    Edit,
    Chat as ChatIcon,
    Call as CallIcon,
    AccountCircle as ContactIcon,
    ArrowBackIos,
    CameraAlt,
    Close,
} from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
    selectActiveTab,
    setActiveTab,
    shouldShowProfileEditor,
    setOpenEditProfile,
} from "../slice/sidebarSlice";

import SidebarContactList from "./ContactList";
import SidebarCallList from "./CallList";
import SidebarChatList from "./ChatList";
import LeftSidebarLayout from "./LeftSidebarLayout";
import SearchBox from "./SearchBox";

import logo from "../../../assets/logo.svg";
import { selectUser } from "../../../store/userSlice";
import uploadFile from "../../../utils/uploadFile";

import { useUpdateMutation } from "../../auth/api/auth";

type NavigationType = {
    name: "call" | "chat" | "contact";
    icon: OverridableComponent<SvgIconTypeMap<unknown, "svg">> & {
        muiName: string;
    };
    Element: (props: any) => React.ReactElement;
};

const navigation: NavigationType[] = [
    { name: "chat", icon: ChatIcon, Element: SidebarChatList },
    { name: "call", icon: CallIcon, Element: SidebarCallList },
    { name: "contact", icon: ContactIcon, Element: SidebarContactList },
];

export default function LeftSidebarHome({
    setSidebar,
}: {
    setSidebar: (s: string) => void;
}): React.ReactElement {
    const dispatch = useDispatch();
    const activeTab = useSelector(selectActiveTab);
    var user = useSelector(selectUser);
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [update, updateMutation] = useUpdateMutation();
    const [name, setName] = React.useState(user.displayName);
    const [proposedName, setProposedName] = React.useState(user.displayName);
    const [profileAvatarUrl, setProfileAvatarUrl] = React.useState(user.avatarUrl);
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProposedName(event.target.value);
    };

    const profileEditingOpen = useSelector(shouldShowProfileEditor);

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleChangeTab = (value: "call" | "chat" | "contact"): void => {
        dispatch(setActiveTab(value));
    };
    const setOpenEditor = () => dispatch(setOpenEditProfile(!profileEditingOpen));
    const closeEditor = () => dispatch(setOpenEditProfile(false));
    const ActiveElement = navigation.find((n) => n.name === activeTab)?.Element;

    const [editProfileName, setEditProfileName] = useState(false);

    const [file, setFile] = useState<File>();
    const imageRef = useRef(null);

    const showOpenFileDialog = () => {
        imageRef.current.click();
    };

    const openEditName = () => {
        setEditProfileName(true);
    };
    const closeEditName = () => {
        setEditProfileName(false);
    };
    const [editProfilePicture, setEditProfilePicture] = useState(false);
    const openEditPicture = () => {
        setEditProfilePicture(true);
    };
    const closeEditPicture = () => {
        setEditProfilePicture(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];
        // setProfileAvatarUrl(URL.createObjectURL(uploadedFile));
        setFile(uploadedFile);
    };

    useEffect(() => {
        handleUpdateUser();
    }, [file]);

    const selectedEditAction = (editAction: string) => {
        if (editAction === "upload") {
            showOpenFileDialog();
        } else {
        }
    };

    const handleUpdateUser = async () => {
        try {
            setLoading(true);
            const uploadedFile = await uploadFile({
                file,
                type: "avatar",
                relationId: user.id,
            });

            await update({ displayName: proposedName, avatarUrl: uploadedFile.path }).unwrap();
            setName(proposedName);
            setProfileAvatarUrl(uploadedFile.path);
            setLoading(false);
            closeEditName();
        } catch (error) {
            setLoading(false);

            console.error("Update failed ", error);
        }
    };

    return (
        <LeftSidebarLayout>
            {profileEditingOpen ? (
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
                                <IconButton
                                    onClick={(e) => {
                                        closeEditor();
                                    }}
                                >
                                    <ArrowBackIos />
                                </IconButton>
                                <Typography variant="h6">Profile</Typography>
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
                                    src={profileAvatarUrl}
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
                                                    handleUpdateUser();
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
                    </Stack>
                    {editProfilePicture ? (
                        <EditPhotoDialog
                            open={editProfilePicture}
                            onClose={closeEditPicture}
                            onConfirm={selectedEditAction}
                        />
                    ) : null}
                </Box>
            ) : (
                <>
                    <Box px={2.5} borderBottom="0.5px solid #C9C9CA">
                        <Box display="flex" height="80px" justifyContent="space-between">
                            <Box display="flex" flexDirection="column" justifyContent="center">
                                <img width="40px" height="40px" src={logo} />
                            </Box>
                            <Box display="flex" alignItems="center">
                                <Box mr={3}>
                                    <IconButton
                                        onClick={(e) => {
                                            setOpenEditor();
                                        }}
                                    >
                                        <Avatar alt={user.displayName} src={profileAvatarUrl} />
                                    </IconButton>
                                </Box>
                                <Box mr={3}>
                                    <Settings
                                        sx={{ width: "25px", color: "#9BB4CF", cursor: "pointer" }}
                                    />
                                </Box>
                                <Box>
                                    <Edit
                                        sx={{ width: "25px", color: "#9BB4CF", cursor: "pointer" }}
                                        onClick={() => setSidebar("new_chat")}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box order={isMobile ? 2 : 0} px={5} pt={2} mb={3}>
                        <Box display="flex" justifyContent="space-between">
                            {navigation.map((item) => (
                                <ActionIcon
                                    key={item.name}
                                    Icon={item.icon}
                                    handleClick={() => handleChangeTab(item.name)}
                                    isActive={activeTab === item.name}
                                />
                            ))}
                        </Box>
                    </Box>
                    <Box mt={3}>
                        <SearchBox />
                    </Box>
                    <Box flex={1} overflow="hidden">
                        <ActiveElement />
                    </Box>
                </>
            )}
        </LeftSidebarLayout>
    );
}

type ActionIconProps = {
    Icon: OverridableComponent<SvgIconTypeMap<unknown, "svg">> & {
        muiName: string;
    };
    handleClick: () => void;
    isActive?: boolean;
};

function ActionIcon({ Icon, isActive, handleClick }: ActionIconProps) {
    return (
        <Box
            onClick={handleClick}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="52px"
            height="52px"
            borderRadius="50%"
            p={1}
            bgcolor={isActive ? "#E5F4FF" : "transparent"}
            sx={{
                cursor: "pointer",
                "&:hover": {
                    bgcolor: "#E5F4FF",
                },
            }}
        >
            <Icon sx={{ width: "20px", color: isActive ? "#4696F0" : "#9BB4CF" }} />
        </Box>
    );
}

export interface EditPhotoDialogProps {
    open: boolean;
    onClose: Function;
    onConfirm: Function;
}

function EditPhotoDialog(props: EditPhotoDialogProps) {
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
