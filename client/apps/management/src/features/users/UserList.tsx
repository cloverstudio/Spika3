import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import Icon from "@mui/icons-material/ArrowRightAlt";
import { Link } from "react-router-dom";
import UserType from "@/types/User";

declare const UPLOADS_BASE_URL: string;

export default function UserList({ users, baseUrl }: { users: UserType[]; baseUrl?: string }) {
    return (
        <Box maxWidth="21rem">
            {users.map((user) => (
                <User
                    key={user.id}
                    name={user.displayName}
                    avatarFileId={user.avatarFileId}
                    telephoneNumber={user.telephoneNumber}
                    linkTo={`/${baseUrl || "users"}/${user.id}`}
                />
            ))}
        </Box>
    );
}

type UserRowProps = {
    name: string;
    avatarFileId?: number;
    telephoneNumber?: string;
    SelectedIcon?: () => React.ReactElement;
    linkTo: string;
};

export function User({
    name,
    avatarFileId,
    telephoneNumber,
    linkTo,
}: UserRowProps): React.ReactElement {
    return (
        <Link to={linkTo} style={{ textDecoration: "none" }}>
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
                    <Icon sx={{ ml: "auto" }} />
                </Box>
            </Box>
        </Link>
    );
}
