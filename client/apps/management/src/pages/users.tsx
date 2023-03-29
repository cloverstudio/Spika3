import React, { useState } from "react";
import { Avatar, Box, Pagination, Typography } from "@mui/material";
import Icon from "@mui/icons-material/ArrowRightAlt";
import { useGetUsersQuery } from "@/features/users/api/users";
import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

declare const UPLOADS_BASE_URL: string;

export default function Users(): React.ReactElement {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useGetUsersQuery(page);
    const strings = useStrings();

    if (isLoading) {
        return <Loader />;
    }

    if (isError || data.status === "error") {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="95vh">
                {strings.errorWhileFetchingUsers}
            </Box>
        );
    }

    const handlePageChange = (_, newPage) => {
        setPage(newPage);
    };

    return (
        <Box
            display="grid"
            sx={{
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "2fr 3fr",
                },
            }}
        >
            <Box
                maxHeight="100vh"
                overflow="auto"
                p={{ base: 2, md: 3, lg: 6 }}
                display="grid"
                gap={4}
                alignContent="start"
            >
                <Typography variant="h2" textAlign="center" fontWeight="bold">
                    {strings.users}
                </Typography>
                <Pagination
                    count={Math.floor(data.data.count / data.data.limit)}
                    page={page}
                    onChange={handlePageChange}
                    size="small"
                    sx={{ mx: "auto" }}
                />
                <UsersList users={data.data.list} />
            </Box>

            <Outlet />
        </Box>
    );
}

function UsersList({ users }: { users: any[] }) {
    return (
        <Box maxWidth="21rem" mx="auto">
            {users.map((user) => (
                <User
                    id={user.id}
                    key={user.id}
                    name={user.displayName}
                    avatarFileId={user.avatarFileId}
                    telephoneNumber={user.telephoneNumber}
                />
            ))}
        </Box>
    );
}

type UserRowProps = {
    name: string;
    id: number;
    avatarFileId?: number;
    telephoneNumber?: number;
    SelectedIcon?: () => React.ReactElement;
};

export function User({
    name,
    id,
    avatarFileId,
    telephoneNumber,
}: UserRowProps): React.ReactElement {
    return (
        <Link to={`/users/${id}`} style={{ textDecoration: "none" }}>
            <Box
                display="flex"
                color="text.primary"
                p={1}
                sx={{
                    cursor: "pointer",
                    "&:hover": {
                        backgroundColor: "background.paper",
                    },
                }}
            >
                <Avatar
                    sx={{ width: 50, height: 50 }}
                    alt={name || "U"}
                    src={`${UPLOADS_BASE_URL}/${avatarFileId}`}
                />
                <Box
                    ml={2}
                    display="flex"
                    flexGrow={1}
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box>
                        <Typography fontWeight="500">{name || "{name}"}</Typography>
                        <Typography fontWeight="400" fontSize="0.8rem">
                            {telephoneNumber}
                        </Typography>
                    </Box>
                    <Icon sx={{ ml: 6 }} />
                </Box>
            </Box>
        </Link>
    );
}
