import React, { useState } from "react";

import { Box } from "@mui/material";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Add from "@mui/icons-material/Add";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import { useSelector } from "react-redux";
import { RoomUserType } from "../../../../types/Rooms";
import { selectUserId } from "../../../../store/userSlice";
import { useCreateRoomMutation, useUpdateRoomMutation } from "../../api/room";
import useStrings from "../../../../hooks/useStrings";
import { useNavigate } from "react-router-dom";
import { dynamicBaseQuery } from "../../../../api/api";
import { numberOfMembersDisplayed } from "../../lib/consts";
import AddMembersModal from "./AddMembersModal";

declare const UPLOADS_BASE_URL: string;

export interface DetailsMembersProps {
    members: RoomUserType[];
    roomId: number;
}

export function DetailsMemberView(props: DetailsMembersProps) {
    const strings = useStrings();
    const { members, roomId } = props;
    const [createRoom] = useCreateRoomMutation();

    const userId = useSelector(selectUserId);
    const [update] = useUpdateRoomMutation();
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const hasMore = members.length > numberOfMembersDisplayed;
    const [showMore, setShowMore] = useState(!hasMore);

    const navigate = useNavigate();

    const userIsAdmin = members.find((u) => u.userId === userId).isAdmin;

    const handlePromoteToAdmin = (memberId: number) => {
        handleUpdateGroup({
            adminUserIds: members
                .filter((m) => m.isAdmin)
                .map((u) => u.userId)
                .concat(memberId),
        });
    };

    const removeMemberWithId = (memberId: number) => {
        handleUpdateGroup({
            userIds: members.filter((m) => m.userId !== memberId).map((u) => u.userId),
        });
    };

    const handleUpdateGroup = async (data: { userIds?: number[]; adminUserIds?: number[] }) => {
        await update({ roomId, data }).unwrap();
    };

    const handleAddMembers = (addIds: number[]) => {
        if (addIds.length > 0) {
            handleUpdateGroup({ userIds: [...addIds, ...members.map((m) => m.userId)] });
        }

        setOpenAddDialog(false);
    };

    const handleOpenChat = async (memberId: number) => {
        try {
            const res = await dynamicBaseQuery(`/messenger/rooms/users/${memberId}`);

            const room = res.data.room;

            if (room.id) {
                navigate(`/rooms/${room.id}`);
            }
        } catch (error) {
            const created = await createRoom({
                userIds: [memberId],
            }).unwrap();

            if (created.room.id) {
                navigate(`/rooms/${created.room.id}`);
            }
        }
    };

    return (
        <Box pt={5.5}>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <Typography variant="h6">
                    {members.length} {strings.members}
                </Typography>
                {userIsAdmin && (
                    <IconButton size="large" color="primary" onClick={() => setOpenAddDialog(true)}>
                        <Add />
                    </IconButton>
                )}
            </Stack>
            <Box
                component={"ul"}
                sx={{
                    width: "100%",
                    paddingLeft: "0",
                    borderBottomColor: "background.paper",
                    my: 3,
                }}
            >
                {members
                    .slice(0, showMore ? members.length : numberOfMembersDisplayed)
                    .map((roomUser, i) => {
                        const { user } = roomUser;

                        return (
                            <Box
                                component={"li"}
                                key={i}
                                sx={{
                                    marginBottom: 2,
                                    listStyle: "none",
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <Avatar
                                        alt={user.displayName}
                                        src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
                                        onClick={() => handleOpenChat(user.id)}
                                        sx={{ cursor: "pointer" }}
                                    />
                                    <Box>
                                        {user.displayName} {user.isBot ? ` (${strings.bot}) ` : ""}{" "}
                                    </Box>
                                </Box>

                                <Box>
                                    {roomUser.isAdmin ? (
                                        <Box display="flex" gap={1} alignItems="center">
                                            <Typography>{strings.admin}</Typography>
                                            {userIsAdmin && user.id !== userId && (
                                                <UserMenu
                                                    onRemove={() => removeMemberWithId(user.id)}
                                                    onOpenChat={() => handleOpenChat(user.id)}
                                                />
                                            )}
                                        </Box>
                                    ) : user.isBot ? (
                                        <></>
                                    ) : (
                                        userIsAdmin && (
                                            <UserMenu
                                                onRemove={() => removeMemberWithId(user.id)}
                                                onPromote={() => handlePromoteToAdmin(user.id)}
                                                onOpenChat={() => handleOpenChat(user.id)}
                                            />
                                        )
                                    )}
                                </Box>
                            </Box>
                        );
                    })}

                {hasMore && (
                    <Button onClick={() => setShowMore(!showMore)} fullWidth variant="text">
                        {showMore ? strings.showLess : strings.showMore}
                    </Button>
                )}
            </Box>

            {openAddDialog && (
                <AddMembersModal
                    open={openAddDialog}
                    onClose={() => setOpenAddDialog(false)}
                    onSave={handleAddMembers}
                    existingMembers={members}
                />
            )}
        </Box>
    );
}

type UserMenuProps = {
    onRemove: () => void;
    onPromote?: () => void;
    onOpenChat: () => void;
};

function UserMenu({ onRemove, onPromote, onOpenChat }: UserMenuProps) {
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
            <IconButton size="large" onClick={handleClick}>
                <MoreHoriz />
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem
                    onClick={() => {
                        onRemove();
                        handleClose();
                    }}
                >
                    {strings.remove}
                </MenuItem>
                {onPromote && (
                    <MenuItem
                        onClick={() => {
                            onPromote();
                            handleClose();
                        }}
                    >
                        {strings.makeAdmin}
                    </MenuItem>
                )}

                <MenuItem
                    onClick={() => {
                        onOpenChat();
                        handleClose();
                    }}
                >
                    {strings.goToChat}
                </MenuItem>
            </Menu>
        </div>
    );
}
