import React, { useState, useEffect } from "react";
import {
    Box,
    Stack,
    IconButton,
    Typography,
    Avatar,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    Menu,
    MenuItem,
} from "@mui/material";
import { Close, Add, Check, MoreHoriz } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RoomUserType } from "../../../../types/Rooms";
import { selectUserId } from "../../../../store/userSlice";
import { useCreateRoomMutation, useUpdateRoomMutation } from "../../api/room";
import { useGetContactsQuery, useGetContactsByKeywordQuery } from "../../api/contacts";
import User from "../../../../types/User";
import Contacts from "../../../../types/Contacts";
import { refreshOne as refreshOneRoom } from "../../slices/leftSidebar";
import useStrings from "../../../../hooks/useStrings";
import { useNavigate } from "react-router-dom";
import { dynamicBaseQuery } from "../../../../api/api";
import { numberOfMembersDisplayed } from "../../lib/consts";

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
    const dispatch = useDispatch();
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

    const handleUpdateGroup = async (data: any) => {
        const { room } = await update({ roomId, data }).unwrap();
        dispatch(refreshOneRoom(room));
    };

    const closeAddMemberDialog = (addIds?: Array<number>) => {
        if (addIds && addIds.length > 0) {
            const membersArray: number[] = [...addIds];

            members.forEach((participant) => {
                membersArray.push(participant.userId);
            });

            handleUpdateGroup({ userIds: membersArray });
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
                                        <Typography>{strings.admin}</Typography>
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
                <AddMembersDialog
                    open={openAddDialog}
                    onClose={closeAddMemberDialog}
                    onSave={closeAddMemberDialog}
                    roomId={roomId}
                    addedIds={[]}
                    existedMembers={members}
                />
            )}
        </Box>
    );
}

export interface AddMembersDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (arg0: Array<number>) => void;
    roomId: number;
    addedIds: number[];
    existedMembers: RoomUserType[];
}

export function AddMembersDialog(props: AddMembersDialogProps) {
    const strings = useStrings();
    const [searchTerm, setSearchTerm] = React.useState("");
    const [searchTermDelay, setSearchTermDelay] = React.useState("");
    const [contacts, setContacts] = React.useState<Contacts>(null);
    const contactSearchResult = useGetContactsByKeywordQuery(searchTermDelay);
    const { onClose, open } = props;
    const { data: contactData } = useGetContactsQuery({ page: 1, keyword: "" });
    const [selectedIds, setSelectedIds] = React.useState<Array<number>>([]);

    useEffect(() => {
        if (contactData) {
            setContacts(contactData);
        }
    }, [contactData]);

    const handleRowClick = (userId: number) => {
        if (selectedIds.indexOf(userId) === -1) {
            setSelectedIds([...selectedIds, userId]);
        } else {
            setSelectedIds(selectedIds.filter((selectedUserId) => selectedUserId !== userId));
        }
    };

    const handleSaveClick = async () => {
        props.onSave(selectedIds);
    };

    useEffect(() => {
        if (contactSearchResult.data) {
            setContacts(contactSearchResult.data);
        }
    }, [contactSearchResult]);

    let timerId: NodeJS.Timeout;

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle sx={{ textAlign: "center" }}>{strings.addMembers}</DialogTitle>
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    margin: "0",
                    padding: "5px",
                    position: "absolute",
                    right: "10px",
                    top: "12px",
                }}
                onClick={onClose}
            >
                <Close />
            </IconButton>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                <TextField
                    id="outlined-basic"
                    label={strings.search}
                    variant="outlined"
                    sx={{ width: "80%" }}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        clearTimeout(timerId);
                        timerId = setTimeout(() => {
                            setSearchTermDelay(e.target.value);
                        }, 500);
                    }}
                />
            </Stack>
            <Box width="300px" m="1rem">
                <Box display="flex" justifyContent="space-between" width={"100%"}>
                    <Box width={"100%"}>
                        {contacts
                            ? contacts.list.map((u) => (
                                  <AddMemberRow
                                      key={u.id}
                                      user={u}
                                      onClick={handleRowClick}
                                      existed={
                                          !!props.existedMembers.find(
                                              (member) => member.userId === u.id
                                          )
                                      }
                                      checked={selectedIds.includes(u.id)}
                                  />
                              ))
                            : null}
                    </Box>
                </Box>
            </Box>
            <Button
                variant="contained"
                size="medium"
                sx={{ margin: 2 }}
                onClick={() => {
                    handleSaveClick();
                }}
            >
                {strings.add}
            </Button>
        </Dialog>
    );
}

export interface AddMembersRowProps {
    user: User;
    onClick: (arg0: number) => void;
    existed: boolean;
    checked: boolean;
}

export function AddMemberRow({
    user,
    onClick,
    existed,
    checked,
}: AddMembersRowProps): React.ReactElement {
    return (
        <Box
            px={2.5}
            display="flex"
            py={1.5}
            sx={{ cursor: existed ? "" : "pointer", opacity: existed ? 0.3 : 1.0 }}
            onClick={() => {
                onClick(user.id);
            }}
        >
            <Avatar
                sx={{ width: 50, height: 50 }}
                alt={user.displayName}
                src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
            />
            <Box
                ml={2}
                display="flex"
                flexGrow={1}
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography fontWeight="500">{user.displayName}</Typography>

                {checked ? <Check /> : null}
            </Box>
        </Box>
    );
}

type UserMenuProps = {
    onRemove: () => void;
    onPromote: () => void;
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
                <MenuItem onClick={onRemove}>{strings.remove}</MenuItem>
                <MenuItem onClick={onPromote}>{strings.makeAdmin}</MenuItem>
                <MenuItem onClick={onOpenChat}>{strings.goToChat}</MenuItem>
            </Menu>
        </div>
    );
}
