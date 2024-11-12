import React from "react";

import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ExitToApp from "@mui/icons-material/ExitToApp";
import DoDisturb from "@mui/icons-material/DoDisturb";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

import { RoomType } from "../../../../types/Rooms";
import { useShowBasicDialog } from "../../../../hooks/useModal";
import {
    useDeleteRoomMutation,
    useGetRoomBlockedQuery,
    useLeaveRoomMutation,
} from "../../api/room";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { hideRightSidebar } from "../../slices/rightSidebar";
import { removeRoom } from "../../slices/leftSidebar";
import { selectUserId } from "../../../../store/userSlice";
import { useTranslation } from "react-i18next";
import { useBlockUserMutation, useRemoveUserFromBlockListMutation } from "../../api/user";
import { useAppDispatch } from "../../../../hooks";

export interface DetailsDestructiveActionsProps {
    room: RoomType;
}

export function DetailsDestructiveActionsView({ room }: DetailsDestructiveActionsProps) {
    const { t } = useTranslation();
    const { type, id, users } = room;

    const userId = useSelector(selectUserId);
    const showBasicDialog = useShowBasicDialog();
    const [leaveRoom] = useLeaveRoomMutation();
    const [deleteRoom] = useDeleteRoomMutation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [blockUser] = useBlockUserMutation();
    const [unblockUser] = useRemoveUserFromBlockListMutation();

    const { data: roomBlock } = useGetRoomBlockedQuery(id);

    const userIsAdmin = users.find((u) => u.userId === userId).isAdmin;
    const otherUserId = users.find((u) => u.userId !== userId)?.userId;

    const handleLeave = () => {
        const haveOtherAdmins = users.filter((u) => u.isAdmin && u.userId !== userId).length > 0;

        if (!haveOtherAdmins) {
            return showBasicDialog({
                text: t("cantLeaveAdminGroup"),
                title: t("unavailableAction"),
                allowButtonLabel: t("ok"),
            });
        }

        showBasicDialog(
            {
                text: t("leaveGroupQuestion"),
                title: t("confirm"),
                allowButtonLabel: t("ok"),
                denyButtonLabel: t("cancel"),
            },
            () =>
                leaveRoom({ roomId: id })
                    .unwrap()
                    .then(() => {
                        dispatch(hideRightSidebar());
                        dispatch(removeRoom(id));
                        navigate("/app");
                    }),
        );
    };

    const handleDelete = () => {
        showBasicDialog(
            {
                text: t("deleteGroupQuestion"),
                title: t("confirm"),
                allowButtonLabel: t("ok"),
                denyButtonLabel: t("cancel"),
            },
            () =>
                deleteRoom({ roomId: id })
                    .unwrap()
                    .then(() => {
                        dispatch(hideRightSidebar());
                        dispatch(removeRoom(id));
                        navigate("/app");
                    }),
        );
    };

    const handleBlock = () => {
        showBasicDialog(
            {
                text: t("blockUserQuestion"),
                title: t("confirm"),
                allowButtonLabel: t("yes"),
                denyButtonLabel: t("cancel"),
            },
            () =>
                blockUser(otherUserId)
                    .unwrap()
                    .then(() => {
                        console.log("done");
                    }),
        );
    };

    const handleUnblock = () => {
        showBasicDialog(
            {
                text: t("unblockUserQuestion"),
                title: t("confirm"),
                allowButtonLabel: t("yes"),
                denyButtonLabel: t("cancel"),
            },
            () =>
                unblockUser(otherUserId)
                    .unwrap()
                    .then(() => {
                        console.log("done");
                    }),
        );
    };

    return (
        <Stack pt={5.5} spacing={1}>
            {type === "private" && !roomBlock && (
                <IconButton
                    size="large"
                    sx={{
                        p: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                    // onClick={handleBlock}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            width: "100%",
                        }}
                    >
                        <DoDisturb style={{ fill: "red" }} />
                        <Typography variant="subtitle1" color="red">
                            {t("blockUser")}
                        </Typography>
                    </Stack>
                </IconButton>
            )}
            {type === "private" && roomBlock && (
                <IconButton
                    size="large"
                    sx={{
                        p: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                    onClick={handleUnblock}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            width: "100%",
                        }}
                    >
                        <Typography variant="subtitle1" color="red">
                            {t("unblockUser")}
                        </Typography>
                    </Stack>
                </IconButton>
            )}
            {type === "group" && (
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        p: 1,

                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                    onClick={handleLeave}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            width: "100%",
                        }}
                    >
                        <ExitToApp style={{ fill: "red" }} />

                        <Typography variant="subtitle1" color="red">
                            {t("exitGroup")}
                        </Typography>
                    </Stack>
                </IconButton>
            )}

            {type === "group" && userIsAdmin && (
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        p: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                    onClick={handleDelete}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            width: "100%",
                        }}
                    >
                        <DeleteOutline style={{ fill: "red" }} />

                        <Typography variant="subtitle1" color="red">
                            {t("deleteGroup")}
                        </Typography>
                    </Stack>
                </IconButton>
            )}
        </Stack>
    );
}
