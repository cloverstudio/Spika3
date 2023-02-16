import React, { useContext, useState } from "react";

import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";

import Close from "@mui/icons-material/Close";
import Check from "@mui/icons-material/Check";
import { RoomUserType } from "../../../../types/Rooms";
import User from "../../../../types/User";
import useStrings from "../../../../hooks/useStrings";
import SidebarContactList from "../leftSidebar/ContactList";
import SelectedMembers from "../SelectedMembers";
import { ThemeContext } from "../../../../theme";

declare const UPLOADS_BASE_URL: string;

type AddMembersModalProps = {
    open: boolean;
    onClose: () => void;
    onSave: (userIds: number[]) => void;
    existingMembers: RoomUserType[];
};

export default function AddMembersModal(props: AddMembersModalProps) {
    const strings = useStrings();
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const { theme } = useContext(ThemeContext);

    const { onClose, open, onSave, existingMembers } = props;

    const handleSave = () => {
        onSave(selectedUsers.map((u) => u.id));
    };

    const handleUserClick = (user: User): void => {
        const userIsSelected = [
            ...selectedUsers.map(({ id }) => id),
            ...existingMembers.map((u) => u.userId),
        ].includes(user.id);

        const users = userIsSelected
            ? selectedUsers.filter(({ id }) => id !== user.id)
            : [...selectedUsers, user];

        setSelectedUsers(users);
    };

    return (
        <Dialog
            onClose={onClose}
            open={open}
            maxWidth="lg"
            sx={{
                ".MuiDialog-paper": {
                    backgroundColor: "background.default",
                },
            }}
        >
            <Box width={{ md: 428 }} px={2.5} py={2} sx={{ overflow: "hidden" }} className={theme}>
                <DialogTitle sx={{ textAlign: "center", p: 0, mb: 2 }}>
                    {strings.addMembers}
                </DialogTitle>
                <IconButton
                    size="large"
                    sx={{
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        position: "absolute",
                        right: 20,
                        top: 20,
                        p: 0,
                    }}
                    onClick={onClose}
                >
                    <Close />
                </IconButton>

                <SelectedMembers selectedUsers={selectedUsers} onRemove={handleUserClick} />

                <Box mb={2} mx={-2.5} maxHeight="50vh" sx={{ overflowY: "auto" }}>
                    <SidebarContactList
                        hideBots
                        handleUserClick={handleUserClick}
                        selectedUsersIds={[
                            ...selectedUsers.map(({ id }) => id),
                            ...existingMembers.map((u) => u.userId),
                        ]}
                    />
                </Box>

                <Button variant="contained" fullWidth size="medium" onClick={handleSave}>
                    {strings.add}
                </Button>
            </Box>
        </Dialog>
    );
}

export interface AddMembersRowProps {
    user: User;
    onClick: (arg0: number) => void;
    existed: boolean;
    checked: boolean;
}

export function AddMemberRow({
    user,
    onClick,
    existed,
    checked,
}: AddMembersRowProps): React.ReactElement {
    return (
        <Box
            px={2.5}
            display="flex"
            py={1.5}
            sx={{ cursor: existed ? "" : "pointer", opacity: existed ? 0.3 : 1.0 }}
            onClick={() => {
                onClick(user.id);
            }}
        >
            <Avatar
                sx={{ width: 50, height: 50 }}
                alt={user.displayName}
                src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
            />
            <Box
                ml={2}
                display="flex"
                flexGrow={1}
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography fontWeight="500">{user.displayName}</Typography>

                {checked ? <Check /> : null}
            </Box>
        </Box>
    );
}
