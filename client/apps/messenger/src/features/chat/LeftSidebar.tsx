import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Badge, Avatar, Typography, TextField } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

import { useCreateRoomMutation } from "./api/room";

import User from "../../types/User";

import SidebarContactList, { ContactRow } from "./components/ContactList";
import LeftSidebarLayout from "./components/LeftSidebarLayout";
import LeftSidebarHome from "./components/LeftSidebarHome";
import SidebarNavigationHeader from "./components/SidebarNavigationHeader";
import SearchBox from "./components/SearchBox";

import uploadImage from "../../assets/upload-image.svg";

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
            <SearchBox />

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
    const [createRoom] = useCreateRoomMutation();
    const navigate = useNavigate();

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
            console.log({ room: { userIds: selectedUsers.map((u) => u.id), name, type: "group" } });
            try {
                const res = await createRoom({
                    userIds: selectedUsers.map((u) => u.id),
                    name,
                    type: "group",
                }).unwrap();
                console.log({ res });
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
    const buttonIsDisabled =
        (step === "select_members" && selectedUsers.length < 1) ||
        (step === "edit_group_info" && !name);

    return (
        <LeftSidebarLayout>
            <SidebarNavigationHeader handleBack={handleBack} title={title} />
            {step === "select_members" ? (
                <>
                    <SearchBox />
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
                                                    fontSize: "small",
                                                    color: "white",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => handleUserClick(user)}
                                            />
                                        }
                                        sx={{
                                            "& .MuiBadge-badge": {
                                                padding: "0",
                                            },
                                        }}
                                    >
                                        <Avatar
                                            alt={user.displayName}
                                            src={user.avatarUrl}
                                            sx={{ width: 48, height: 48 }}
                                        />
                                    </Badge>
                                    <Typography
                                        textAlign="center"
                                        fontWeight="medium"
                                        color="#9AA0A6"
                                        fontSize="0.875rem"
                                        lineHeight="1.25rem"
                                    >
                                        {user.displayName}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box mb={10.5} />
                    )}
                    <SidebarContactList
                        selectedUsersIds={selectedUsers.map((u) => u.id)}
                        handleUserClick={handleUserClick}
                    />
                </>
            ) : (
                <>
                    <Box textAlign="center" mt={3} mb={5}>
                        <img width={100} height={100} src={uploadImage} />
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
                        color="#141414"
                        fontWeight="medium"
                        fontSize="0.875rem"
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
