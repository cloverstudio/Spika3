import React, { useState } from "react";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import {
    useDeleteUserMutation,
    useGetUserByIdQuery,
    useGetUserGroupsQuery,
} from "@/features/users/api/users";
import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { useNavigate, useParams } from "react-router-dom";
import EditUserModal from "@/components/EditUserModal";
import dayjs from "dayjs";
import { useShowBasicDialog, useShowSnackBar } from "@/hooks/useModal";
import { Link } from "react-router-dom";

declare const UPLOADS_BASE_URL: string;

export default function Users(): React.ReactElement {
    const id = useParams().id;
    const { data, isLoading, isError } = useGetUserByIdQuery(id);
    const strings = useStrings();

    console.log({ data });

    if (isLoading) {
        return <Loader />;
    }

    if (isError || data.status === "error") {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="95vh">
                {strings.genericError}
            </Box>
        );
    }

    return (
        <Box
            borderLeft="1px solid"
            height="100vh"
            overflow="auto"
            display="grid"
            p={6}
            alignContent="start"
            sx={{ borderColor: "divider" }}
        >
            <Box maxHeight="100vh">
                <UserDetails user={data.data.user} />
            </Box>
        </Box>
    );
}

function UserDetails({ user }: { user: any }) {
    const [deleteUser] = useDeleteUserMutation();
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
                    .then(() => {
                        showBasicSnackbar({ severity: "success", text: strings.userDeleted });
                        navigate("/users");
                    });
            }
        );
    };

    return (
        <Box>
            <Box mb={3}>
                <Typography variant="h3" mb={4} fontWeight="bold">
                    {user.displayName || "{name}"}
                </Typography>

                <Avatar
                    sx={{ width: 100, height: 100 }}
                    alt={user.displayName || "U"}
                    src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
                />

                <Stack my={4} spacing={1}>
                    <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.displayName}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.displayName}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.telephoneNumber}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.telephoneNumber}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.emailAddress}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.emailAddress}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.createdAt}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.createdAt
                                ? dayjs(user.createdAt).format("DD/MM/YY HH:mm:ss")
                                : ""}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.modifiedAt}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.modifiedAt
                                ? dayjs(user.modifiedAt).format("DD/MM/YY HH:mm:ss")
                                : ""}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.verified}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {strings.verified ? strings.yes : strings.no}
                        </Typography>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
                        <Typography color="text.tertiary" fontSize="0.85rem">
                            {strings.verificationCode}
                        </Typography>
                        <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                            {user.verificationCode}
                        </Typography>
                    </Box>
                    <UsersGroups userId={user.id} />
                </Stack>
            </Box>
            <Box display="flex" gap={2}>
                <Button onClick={() => setShowEdit(true)} variant="contained" color="primary">
                    Edit
                </Button>
                <Button onClick={handleDelete} variant="outlined" color="error">
                    Delete
                </Button>
            </Box>
            {showEdit && <EditUserModal user={user} onClose={() => setShowEdit(false)} />}
        </Box>
    );
}

function UsersGroups({ userId }: { userId: string }) {
    const strings = useStrings();
    const { data, isLoading } = useGetUserGroupsQuery(userId);

    if (isLoading) {
        return null;
    }

    if (data.status === "error") {
        return <Box>Error fetching groups</Box>;
    }

    return (
        <Box display="grid" gridTemplateColumns="1fr 2fr" gap={2}>
            <Typography color="text.tertiary" fontSize="0.85rem">
                {strings.groups}
            </Typography>

            <Typography fontWeight="medium" color="text.secondary" fontSize="0.8rem">
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {data?.data?.rooms.map((r) => (
                        <Link
                            key={r.id}
                            to={`/groups/${r.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            {r.name}
                        </Link>
                    ))}
                </Box>
            </Typography>
        </Box>
    );
}
