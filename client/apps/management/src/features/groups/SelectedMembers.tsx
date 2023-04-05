import React from "react";

import Clear from "@mui/icons-material/Clear";
import { Box } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import User from "@/types/User";

declare const UPLOADS_BASE_URL: string;

type SelectedMembersProps = {
    selectedUsers: User[];
    onRemove: (user: User) => void;
};

export default function SelectedMembers({ selectedUsers, onRemove }: SelectedMembersProps) {
    if (!selectedUsers.length) {
        return <Box mb={3} />;
    }

    return (
        <Box display="flex" flexWrap="wrap" gap={1.5} px={2.5} mb={2}>
            {selectedUsers.map((user) => (
                <Box key={user.id} textAlign="center">
                    <Badge
                        overlap="circular"
                        color="primary"
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        badgeContent={
                            <Clear
                                sx={{
                                    color: "white",
                                    cursor: "pointer",
                                }}
                                onClick={() => onRemove(user)}
                            />
                        }
                        sx={{
                            "& .MuiBadge-badge": {
                                padding: "0",
                                height: "24px",
                                width: "24px",
                                borderRadius: "50%",
                            },
                            mt: 1,
                        }}
                    >
                        <Avatar
                            alt={user.displayName}
                            src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
                            sx={{ width: 48, height: 48 }}
                        />
                    </Badge>
                    <Typography
                        textAlign="center"
                        fontWeight="medium"
                        color="text.tertiary"
                        lineHeight="1.25rem"
                        sx={{
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                        }}
                        maxWidth="55px"
                    >
                        {user.displayName}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}
