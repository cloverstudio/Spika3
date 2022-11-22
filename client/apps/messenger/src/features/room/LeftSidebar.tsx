import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Badge, Avatar, Typography, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/ClearRounded";

import { useCreateRoomMutation } from "./api/room";

import User from "../../types/User";

import SidebarContactList, { ContactRow } from "./components/leftSidebar/ContactList";
import LeftSidebarLayout from "./components/leftSidebar/LeftSidebarLayout";
import LeftSidebarHome from "./components/leftSidebar/LeftSidebarHome";
import SidebarNavigationHeader from "./components/leftSidebar/SidebarNavigationHeader";

import uploadImage from "../../assets/upload-image.svg";
import uploadFile from "../../utils/uploadFile";

import { crop } from "../../utils/crop";
import * as Constants from "../../../../../lib/constants";

declare const UPLOADS_BASE_URL: string;

export default function LeftSidebar(): React.ReactElement {
    const [sidebar, setSidebar] = useState("");

    if (sidebar === "new_chat") {
        return <LeftSidebarNewChat setSidebar={setSidebar} />;
    }

    if (sidebar === "new_group") {
        return <LeftSidebarNewGroup setSidebar={setSidebar} />;
    }

    return <LeftSidebarHome setSidebar={setSidebar} />;
}

function LeftSidebarNewChat({
    setSidebar,
}: {
    setSidebar: (s: string) => void;
}): React.ReactElement {
    return (
        <LeftSidebarLayout>
            <SidebarNavigationHeader handleBack={() => setSidebar("")} title="New chat" />

            <Box textAlign="center">
                <Button onClick={() => setSidebar("new_group")}>New group chat</Button>
            </Box>
            <SidebarContactList />
        </LeftSidebarLayout>
    );
}

function LeftSidebarNewGroup({
    setSidebar,
}: {
    setSidebar: (s: string) => void;
}): React.ReactElement {
    const [step, setStep] = useState<"select_members" | "edit_group_info">("select_members");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [name, setName] = useState("");
    const [file, setFile] = useState<File>();
    const uploadFileRef = React.useRef(null);

    const [createRoom] = useCreateRoomMutation();
    const navigate = useNavigate();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];
        const objectUrl = URL.createObjectURL(uploadedFile);

        const croppedImage = await crop(
            objectUrl,
            1,
            Constants.LSKEY_CROPSIZE,
            Constants.LSKEY_CROPSIZE
        );
        const file = new File([croppedImage], "image.png");

        setFile(file);
    };

    const handleUserClick = (user: User): void => {
        const selectedUsersIds = selectedUsers.map((u) => u.id);
        const userIsSelected = selectedUsersIds.includes(user.id);

        const ids = userIsSelected
            ? selectedUsers.filter(({ id }) => id !== user.id)
            : [...selectedUsers, user];

        setSelectedUsers(ids);
    };

    const handleBack = () => {
        if (step === "select_members") {
            setSidebar("new_chat");
        } else {
            setStep("select_members");
        }
    };

    const handleNext = async () => {
        if (step === "select_members") {
            setStep("edit_group_info");
        } else {
            try {
                const uploadedFile =
                    file &&
                    (await uploadFile({
                        file,
                        type: "avatar",
                    }));
                const res = await createRoom({
                    userIds: selectedUsers.map((u) => u.id),
                    name,
                    type: "group",
                    avatarUrl: uploadedFile?.path || "",
                }).unwrap();

                if (res && res.room?.id) {
                    setSidebar("");
                    navigate(`/rooms/${res.room.id}`);
                }
            } catch (error) {
                console.error("Room create failed!", { error });
            }
        }
    };

    const title = step === "select_members" ? "Select members" : "Group members";
    const buttonText = step === "select_members" ? "Next" : "Create";
    const buttonIsDisabled = step === "edit_group_info" && !name;

    return (
        <LeftSidebarLayout>
            <SidebarNavigationHeader handleBack={handleBack} title={title} />
            {step === "select_members" ? (
                <>
                    {selectedUsers.length > 0 ? (
                        <Box display="flex" px={2.5} mb={2}>
                            {selectedUsers.map((user) => (
                                <Box key={user.id} mr={1.5}>
                                    <Badge
                                        overlap="circular"
                                        color="primary"
                                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                                        badgeContent={
                                            <ClearIcon
                                                sx={{
                                                    color: "white",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => handleUserClick(user)}
                                            />
                                        }
                                        sx={{
                                            "& .MuiBadge-badge": {
                                                padding: "0",
                                                height: "24px",
                                                width: "24px",
                                                borderRadius: "50%",
                                            },
                                            mt: 1,
                                        }}
                                    >
                                        <Avatar
                                            alt={user.displayName}
                                            src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
                                            sx={{ width: 48, height: 48 }}
                                        />
                                    </Badge>
                                    <Typography
                                        textAlign="center"
                                        fontWeight="medium"
                                        color="text.tertiary"
                                        lineHeight="1.25rem"
                                    >
                                        {user.displayName}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box mb={11.5} />
                    )}
                    <SidebarContactList
                        selectedUsersIds={selectedUsers.map((u) => u.id)}
                        handleUserClick={handleUserClick}
                    />
                </>
            ) : (
                <>
                    <Box textAlign="center" mt={3} mb={5}>
                        <img
                            width={100}
                            height={100}
                            style={{ objectFit: "cover", borderRadius: "50%" }}
                            src={file ? URL.createObjectURL(file) : uploadImage}
                            onClick={() => uploadFileRef.current?.click()}
                        />
                        <input
                            onChange={handleFileUpload}
                            type="file"
                            style={{ display: "none" }}
                            ref={uploadFileRef}
                            accept="image/*"
                        />
                    </Box>
                    <TextField
                        sx={{ mb: 4, px: 2.5 }}
                        required
                        fullWidth
                        id="name"
                        placeholder="Group name..."
                        name="name"
                        autoFocus
                        value={name}
                        onChange={({ target }) => setName(target.value)}
                    />

                    <Typography
                        textAlign="right"
                        color="primary.main"
                        fontWeight="medium"
                        lineHeight="1.25rem"
                        sx={{ px: 2.5, py: 2 }}
                    >
                        {selectedUsers.length} people selected
                    </Typography>
                    <Box flexGrow={1} sx={{ overflowY: "auto" }}>
                        {selectedUsers.map((user) => (
                            <ContactRow
                                key={user.id}
                                name={user.displayName}
                                selected={true}
                                avatarUrl={user.avatarUrl}
                                SelectedIcon={() => (
                                    <ClearIcon onClick={() => handleUserClick(user)} />
                                )}
                            />
                        ))}
                    </Box>
                </>
            )}
            <Box px={2.5} mb={1}>
                <Button
                    disabled={buttonIsDisabled}
                    fullWidth
                    variant="contained"
                    onClick={handleNext}
                >
                    {buttonText}
                </Button>
            </Box>
        </LeftSidebarLayout>
    );
}
