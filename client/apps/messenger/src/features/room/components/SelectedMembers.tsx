import React from "react";

import Clear from "@mui/icons-material/Clear";
import { Box } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import User from "../../../types/User";
import { Room } from "@prisma/client";

type SelectedMembersProps = {
    selectedUsers: User[];
    selectedGroups?: Room[];
    onRemove: (user: User) => void;
    onGroupRemove?: (group: Room) => void;
};

export default function SelectedMembers({
    selectedUsers,
    selectedGroups,
    onRemove,
    onGroupRemove,
}: SelectedMembersProps) {
    if (!selectedUsers.length && !selectedGroups?.length) {
        return <Box mb={3} />;
    }

    return (
        <Box
            display="flex"
            gap={3}
            px={2.5}
            mb={2}
            pb={1}
            sx={{ overflowX: "scroll", overflowY: "hidden" }}
        >
            {selectedUsers.map((user) => (
                <Box key={user.id} textAlign="center" maxWidth={80} width={80}>
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
                        width={70}
                        fontSize={14}
                        sx={{
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                        }}
                    >
                        {user.displayName}
                    </Typography>
                </Box>
            ))}
            {selectedGroups?.map((group) => (
                <Box key={group.id} textAlign="center" width={80}>
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
                                onClick={() => onGroupRemove(group)}
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
                            alt={group.name}
                            src={`${UPLOADS_BASE_URL}/${group.avatarFileId}`}
                            sx={{ width: 48, height: 48 }}
                        />
                    </Badge>
                    <Typography
                        textAlign="center"
                        fontWeight="medium"
                        color="text.tertiary"
                        lineHeight="1.25rem"
                        width={70}
                        fontSize={14}
                        sx={{
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                        }}
                    >
                        {group.name}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}
