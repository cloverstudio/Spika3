import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import Icon from "@mui/icons-material/ArrowRightAlt";
import { Link } from "react-router-dom";
import useStrings from "@/hooks/useStrings";

declare const UPLOADS_BASE_URL: string;

export default function GroupsList({ groups }: { groups: any[] }) {
    console.log(groups);
    return (
        <Box maxWidth="21rem" mx="auto">
            {groups.map((group) => (
                <Group
                    id={group.id}
                    key={group.id}
                    name={group.name}
                    avatarFileId={group.avatarFileId}
                    userCount={group.users?.length}
                />
            ))}
        </Box>
    );
}

type GroupRowProps = {
    name: string;
    id: number;
    avatarFileId?: number;
    userCount?: number;
};

export function Group({ name, id, avatarFileId, userCount }: GroupRowProps): React.ReactElement {
    const strings = useStrings();
    return (
        <Link to={`/groups/${id}`} style={{ textDecoration: "none" }}>
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
                            {userCount
                                ? userCount === 1
                                    ? `1 ${strings.user.toLowerCase()}`
                                    : `${userCount} ${strings.users.toLowerCase()}`
                                : strings.noUsers}
                        </Typography>
                    </Box>
                    <Icon sx={{ ml: 6 }} />
                </Box>
            </Box>
        </Link>
    );
}
