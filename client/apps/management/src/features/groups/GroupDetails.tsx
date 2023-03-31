import React, { useState } from "react";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
} from "@/features/groups/api/groups";

declare const UPLOADS_BASE_URL: string;

export default function GroupDetails({ group }: { group: any }) {
    const [deleteUser, { isLoading }] = useDeleteGroupMutation();
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const strings = useStrings();
    const showBasicDialog = useShowBasicDialog();
    const showBasicSnackbar = useShowSnackBar();
    const [removeUserFromGroup] = useRemoveUserFromGroupMutation();

    const handleDelete = async () => {
        showBasicDialog(
            {
                allowButtonLabel: strings.yes,
                denyButtonLabel: strings.no,
                text: strings.deleteUserConfirmation,
                title: strings.deleteUser,
            },
            () => {
                deleteUser(group.id)
                    .unwrap()
                    .then((res) => {
                        if (res?.status === "success") {
                            showBasicSnackbar({ severity: "success", text: strings.userDeleted });
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

    return (
        <Box>
            <Box mb={3}>
                <Typography variant="h3" mb={4} fontWeight="bold">
                    {group.name || "{name}"}
                </Typography>

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
                                        to={`/users/${user.id}`}
                                        style={{ textDecoration: "none", color: "inherit" }}
                                    >
                                        {user.user.displayName}
                                    </Link>
                                </Button>
                            ))}
                        </Box>
                    </Box>
                </Stack>
            </Box>
            <Box display="flex" gap={1}>
                <Button size="small" onClick={handleDelete} variant="outlined" color="error">
                    Delete
                </Button>
                <Button
                    size="small"
                    onClick={() => setShowEdit(true)}
                    variant="outlined"
                    color="primary"
                >
                    Edit
                </Button>
            </Box>
            {showEdit && <EditGroupModal group={group} onClose={() => setShowEdit(false)} />}
        </Box>
    );
}
