import React, { useState } from "react";
import { Avatar, Box, Button, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreHoriz from "@mui/icons-material/MoreHoriz";

import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { useNavigate } from "react-router-dom";
import EditGroupModal from "@/features/groups/EditGroupModal";
import dayjs from "dayjs";
import { useShowBasicDialog, useShowSnackBar } from "@/hooks/useModal";
import { Link } from "react-router-dom";
import {
    useRemoveUserFromGroupMutation,
    useDeleteGroupMutation,
    useAddUsersToGroupMutation,
} from "@/features/groups/api/groups";
import { RoomType } from "@/types/Room";
import AddMembersModal from "./AddMembersModal";

declare const UPLOADS_BASE_URL: string;

export default function GroupDetails({ group }: { group: RoomType }) {
    const [deleteGroup, { isLoading }] = useDeleteGroupMutation();
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const [showAddUsersModal, setShowAddUsersModal] = useState(false);
    const [showAddAdminsModal, setShowAddAdminsModal] = useState(false);
    const strings = useStrings();
    const showBasicDialog = useShowBasicDialog();
    const showBasicSnackbar = useShowSnackBar();
    const [removeUserFromGroup] = useRemoveUserFromGroupMutation();
    const [addUsersToGroup] = useAddUsersToGroupMutation();

    const handleDelete = async () => {
        showBasicDialog(
            {
                allowButtonLabel: strings.yes,
                denyButtonLabel: strings.no,
                text: strings.deleteGroupConfirmation,
                title: strings.deleteGroup,
            },
            () => {
                deleteGroup(group.id)
                    .unwrap()
                    .then((res) => {
                        if (res?.status === "success") {
                            showBasicSnackbar({ severity: "success", text: strings.groupDeleted });
                            navigate("/groups");
                            return;
                        }
                        showBasicSnackbar({ severity: "error", text: res.message });
                    });
            }
        );
    };

    if (isLoading) {
        return <Loader />;
    }

    const handleRemoveUserFromGroup = ({
        id,
        name,
        userId,
    }: {
        id: number;
        name: string;
        userId: number;
    }) => {
        showBasicDialog(
            {
                allowButtonLabel: strings.yes,
                denyButtonLabel: strings.no,
                text: strings.removeUserFromGroupConfirmation.replace("this", name),
                title: strings.removeUserFromGroup,
            },
            () => {
                removeUserFromGroup({ userId, groupId: id })
                    .unwrap()
                    .then((res) => {
                        if (res.status === "error") {
                            showBasicSnackbar({
                                severity: "error",
                                text: res.message,
                            });
                            return;
                        }
                        showBasicSnackbar({
                            severity: "success",
                            text: strings.userRemovedFromGroup,
                        });
                    });
            }
        );
    };

    const handleAddUsersToGroup = (usersIds: number[]) => {
        addUsersToGroup({ usersIds, groupId: group.id })
            .unwrap()
            .then((res) => {
                if (res.status === "error") {
                    showBasicSnackbar({
                        severity: "error",
                        text: res.message,
                    });
                    return;
                }
                showBasicSnackbar({
                    severity: "success",
                    text: strings.usersAddedToGroup,
                });
            })
            .finally(() => {
                setShowAddUsersModal(false);
            });
    };

    const handleAddAdminsToGroup = (usersIds: number[]) => {
        addUsersToGroup({ usersIds, groupId: group.id, admin: true })
            .unwrap()
            .then((res) => {
                if (res.status === "error") {
                    showBasicSnackbar({
                        severity: "error",
                        text: res.message,
                    });
                    return;
                }
                showBasicSnackbar({
                    severity: "success",
                    text: strings.usersAddedToGroup,
                });
            })
            .finally(() => {
                setShowAddAdminsModal(false);
            });
    };

    return (
        <Box>
            <Box mb={3}>
                <Box display="flex" mb={4} gap={1} alignItems="center">
                    <Typography variant="h3" fontWeight="bold">
                        {group.name || "{name}"}
                    </Typography>

                    <EditGroupMenu
                        onRemove={handleDelete}
                        onEdit={() => setShowEdit(true)}
                        onAddUser={() => setShowAddUsersModal(true)}
                        onAddAdmin={() => setShowAddAdminsModal(true)}
                    />
                </Box>

                <Avatar
                    sx={{ width: 100, height: 100 }}
                    alt={group.name || "U"}
                    src={`${UPLOADS_BASE_URL}/${group.avatarFileId}`}
                />
                <Stack my={4} spacing={1}>
                    <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.name}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {group.name}
                        </Typography>
                    </Box>

                    <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.createdAt}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {group.createdAt
                                ? dayjs(group.createdAt).format("DD/MM/YY HH:mm:ss")
                                : ""}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.modifiedAt}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {group.modifiedAt
                                ? dayjs(group.modifiedAt).format("DD/MM/YY HH:mm:ss")
                                : ""}
                        </Typography>
                    </Box>

                    <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.users}
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {group.users.map((user: any) => (
                                <Button
                                    key={user.userId}
                                    size="small"
                                    variant="outlined"
                                    endIcon={
                                        <CloseIcon
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRemoveUserFromGroup({
                                                    id: group.id,
                                                    name: group.name,
                                                    userId: user.userId,
                                                });
                                            }}
                                        />
                                    }
                                    sx={{
                                        px: 1,
                                        py: 0.5,
                                    }}
                                >
                                    <Link
                                        to={`/users/${user.user.id}`}
                                        style={{ textDecoration: "none", color: "inherit" }}
                                    >
                                        {user.user.displayName} {user.isAdmin ? "(admin)" : ""}
                                    </Link>
                                </Button>
                            ))}
                        </Box>
                    </Box>
                </Stack>
            </Box>

            {showEdit && <EditGroupModal group={group} onClose={() => setShowEdit(false)} />}
            {showAddUsersModal && (
                <AddMembersModal
                    onSave={handleAddUsersToGroup}
                    open={true}
                    existingMembers={group.users}
                    onClose={() => setShowAddUsersModal(false)}
                />
            )}
            {showAddAdminsModal && (
                <AddMembersModal
                    onSave={handleAddAdminsToGroup}
                    open={true}
                    existingMembers={group.users.filter((u) => u.isAdmin)}
                    onClose={() => setShowAddAdminsModal(false)}
                />
            )}
        </Box>
    );
}

type EditGroupMenuProps = {
    onRemove: () => void;
    onAddAdmin: () => void;
    onAddUser: () => void;
    onEdit: () => void;
};

function EditGroupMenu({ onRemove, onAddUser, onAddAdmin, onEdit }: EditGroupMenuProps) {
    const strings = useStrings();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton size="large" onClick={handleClick} color="primary">
                <MoreHoriz />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                    "& .MuiMenu-list": {
                        p: 0,
                    },
                }}
            >
                <MenuItem
                    divider={true}
                    sx={{
                        color: "red",
                    }}
                    onClick={() => {
                        onRemove();
                        handleClose();
                    }}
                >
                    {strings.delete}
                </MenuItem>
                <MenuItem
                    divider={true}
                    onClick={() => {
                        onEdit();
                        handleClose();
                    }}
                >
                    {strings.edit}
                </MenuItem>
                <MenuItem
                    divider={true}
                    onClick={() => {
                        onAddUser();
                        handleClose();
                    }}
                >
                    {strings.addUser}
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        onAddAdmin();
                        handleClose();
                    }}
                >
                    {strings.addAdmin}
                </MenuItem>
            </Menu>
        </div>
    );
}
