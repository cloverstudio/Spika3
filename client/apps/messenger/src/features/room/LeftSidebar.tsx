import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
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
import useStrings from "../../hooks/useStrings";
import SelectedMembers from "./components/SelectedMembers";

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
    const strings = useStrings();

    return (
        <LeftSidebarLayout>
            <SidebarNavigationHeader handleBack={() => setSidebar("")} title="New chat" />

            <Box textAlign="center">
                <Button onClick={() => setSidebar("new_group")}>{strings.newGroupChat}</Button>
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
    const strings = useStrings();
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
                    avatarFileId: uploadedFile?.id || 0,
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

    const title = step === "select_members" ? strings.selectMembers : strings.groupMembers;
    const buttonText = step === "select_members" ? strings.next : strings.create;
    const buttonIsDisabled = step === "edit_group_info" && !name;

    return (
        <LeftSidebarLayout>
            <SidebarNavigationHeader handleBack={handleBack} title={title} />
            {step === "select_members" ? (
                <>
                    <SelectedMembers selectedUsers={selectedUsers} onRemove={handleUserClick} />
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
                        placeholder={strings.groupName}
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
                        {selectedUsers.length} {strings.peopleSelected}
                    </Typography>
                    <Box flexGrow={1} sx={{ overflowY: "auto" }}>
                        {selectedUsers.map((user) => (
                            <ContactRow
                                key={user.id}
                                name={user.displayName}
                                selected={true}
                                avatarFileId={user.avatarFileId}
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
