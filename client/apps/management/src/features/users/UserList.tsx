import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import Icon from "@mui/icons-material/ArrowRightAlt";
import { Link } from "react-router-dom";
import UserType from "@/types/User";

declare const UPLOADS_BASE_URL: string;

export default function UserList({ users }: { users: UserType[] }) {
    return (
        <Box maxWidth="21rem">
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
    telephoneNumber?: string;
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
