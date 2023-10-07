import React, { useState } from "react";
import { Avatar, Box, Button, IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
    useDeleteUserMutation,
    useGetUserDevicesQuery,
    useExpireUserDeviceMutation,
} from "@/features/users/api/users";
import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { useNavigate } from "react-router-dom";
import EditBotModal from "@/components/EditBotModal";
import dayjs from "dayjs";
import { useShowBasicDialog, useShowSnackBar } from "@/hooks/useModal";
import { Link } from "react-router-dom";
import {
    useGetGroupsByUserIdQuery,
    useRemoveUserFromGroupMutation,
} from "@/features/groups/api/groups";
import { BotUserType } from "@/types/User";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

declare const UPLOADS_BASE_URL: string;

export default function UserDetails({ user }: { user: BotUserType }) {
    const [deleteUser, { isLoading }] = useDeleteUserMutation();
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const strings = useStrings();
    const showBasicDialog = useShowBasicDialog();
    const showBasicSnackbar = useShowSnackBar();

    const handleDelete = async () => {
        showBasicDialog(
            {
                allowButtonLabel: strings.yes,
                denyButtonLabel: strings.no,
                text: strings.deleteUserConfirmation,
                title: strings.deleteUser,
            },
            () => {
                deleteUser(user.id)
                    .unwrap()
                    .then((res) => {
                        if (res?.status === "success") {
                            showBasicSnackbar({ severity: "success", text: strings.userDeleted });
                            navigate("/users");
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

    return (
        <Box>
            <Box mb={3}>
                <Box display="flex" mb={4} gap={1} alignItems="center">
                    <Typography variant="h3" fontWeight="bold">
                        {user.displayName || "{name}"}
                    </Typography>

                    <Box display="flex" gap={0.5}>
                        <IconButton size="large" onClick={handleDelete} color="error">
                            <DeleteIcon />
                        </IconButton>

                        <IconButton size="large" onClick={() => setShowEdit(true)} color="primary">
                            <EditIcon />
                        </IconButton>
                    </Box>
                </Box>
                <Avatar
                    sx={{ width: 100, height: 100 }}
                    alt={user.displayName || "U"}
                    src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
                />
                <Stack my={4} spacing={1}>
                    <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.displayName}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.displayName}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.accessToken}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.device[0]?.token}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.webhookurl}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.webhookUrl}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.createdAt}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.createdAt
                                ? dayjs(user.createdAt).format("DD/MM/YY HH:mm:ss")
                                : ""}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.modifiedAt}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.modifiedAt
                                ? dayjs(user.modifiedAt).format("DD/MM/YY HH:mm:ss")
                                : ""}
                        </Typography>
                    </Box>

                    <UsersGroups userId={user.id} />
                    <UsersDevices userId={user.id} />
                </Stack>
            </Box>

            {showEdit && <EditBotModal user={user} onClose={() => setShowEdit(false)} />}
        </Box>
    );
}

function UsersGroups({ userId }: { userId: number }) {
    const strings = useStrings();
    const { data, isLoading, isError } = useGetGroupsByUserIdQuery(userId);
    const [removeUserFromGroup] = useRemoveUserFromGroupMutation();
    const showBasicDialog = useShowBasicDialog();
    const showBasicSnackbar = useShowSnackBar();

    if (isLoading) {
        return null;
    }

    if (isError || data.status === "error") {
        return <Box>{strings.errorWhileFetchingGroups}</Box>;
    }

    const handleRemoveUserFromGroup = ({ id, name }: { id: number; name: string }) => {
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
        <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
            <Typography color="text.tertiary" fontSize="0.85rem">
                {strings.groups}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={0.5}>
                {data?.data?.rooms.map((r) => (
                    <Button
                        key={r.id}
                        size="small"
                        variant="outlined"
                        endIcon={
                            <CloseIcon
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveUserFromGroup(r);
                                }}
                            />
                        }
                        sx={{
                            px: 1,
                            py: 0.5,
                        }}
                    >
                        <Link
                            to={`/groups/${r.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            {r.name}
                        </Link>
                    </Button>
                ))}
            </Box>
        </Box>
    );
}

function UsersDevices({ userId }: { userId: number }) {
    const strings = useStrings();
    const { data, isLoading, isError } = useGetUserDevicesQuery(userId);
    const [expireDevice] = useExpireUserDeviceMutation();
    const showBasicDialog = useShowBasicDialog();
    const showBasicSnackbar = useShowSnackBar();

    if (isLoading) {
        return null;
    }

    if (isError || data.status === "error") {
        return <Box>{strings.errorWhileFetchingGroups}</Box>;
    }

    const handleExpireToken = ({
        id,
        osName,
        osVersion,
    }: {
        id: number;
        osName: string;
        osVersion: string;
    }) => {
        showBasicDialog(
            {
                allowButtonLabel: strings.yes,
                denyButtonLabel: strings.no,
                text: strings.logoutUserFromDeviceConfirmation.replace(
                    "{deviceName}",
                    `${osName} (${osVersion})`
                ),
                title: strings.logoutUserFromDevice,
            },
            () => {
                expireDevice({ userId, deviceId: id })
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
                            text: strings.userLogoutFromDevice,
                        });
                    });
            }
        );
    };

    return (
        <>
            <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                <Typography color="text.tertiary" fontSize="0.85rem">
                    {strings.activeDevices}
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {data?.data?.devices
                        .filter((r) => r.tokenExpiredAt > +new Date())
                        .map((r) => (
                            <Typography
                                key={r.id}
                                fontWeight="medium"
                                color="text.secondary"
                                fontSize="0.8rem"
                            >
                                {r.osName} ({r.osVersion})
                                <IconButton
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleExpireToken(r);
                                    }}
                                    size="small"
                                    color="error"
                                    sx={{ ml: 0.5 }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Typography>
                        ))}
                </Box>
            </Box>
            <Box display="grid" gridTemplateColumns="2fr 5fr" gap={2}>
                <Typography color="text.tertiary" fontSize="0.85rem">
                    {strings.expiredDevices}
                </Typography>

                <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                    {data?.data?.devices
                        .filter((r) => r.tokenExpiredAt < +new Date())
                        .map((r) => `${r.osName} (${r.osVersion})`)
                        .join(", ")}
                </Typography>
            </Box>
        </>
    );
}
