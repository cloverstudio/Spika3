import React from "react";
import { Box, Stack, Switch } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";

import { RoomType } from "../../../../types/Rooms";
import { setActiveTab } from "../../slices/rightSidebar";
import { useShowSnackBar } from "../../../../hooks/useModal";
import { useMuteRoomMutation, useUnmuteRoomMutation } from "../../api/room";

import { selectUserId, settings as storeSettings } from "../../../../../src/store/userSlice";
import { fetchSettings } from "../../../../../src/store/userSlice";

import * as constants from "../../../../../../../lib/constants";

export interface Props {
    roomData: RoomType;
}

export function DetailsAdditionalInfoView(props: Props) {
    const room: RoomType = props.roomData;
    const dispatch = useDispatch();
    const showSnackBar = useShowSnackBar();
    const [muteRoom] = useMuteRoomMutation();
    const [unmuteRoom] = useUnmuteRoomMutation();
    const settings = useSelector(storeSettings);

    const { type, users } = room;
    const userId = useSelector(selectUserId);
    const userIsAdmin = users.find((u) => u.userId === userId).isAdmin;

    return (
        <Box>
            <Stack
                direction="column"
                alignItems="center"
                spacing={1}
                px={1.5}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {/* <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Shared Media, Links and Docs</Box>
                    <ChevronRight />
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Call history</Box>
                    <ChevronRight />
                </Stack> */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={() => dispatch(setActiveTab("notes"))}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        cursor: "pointer",
                    }}
                >
                    <Box component="span">Notes</Box>
                    <ChevronRight />
                </Stack>
                {((type === "group" && userIsAdmin) || type === "private") && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={() => dispatch(setActiveTab("settings"))}
                        sx={{
                            height: "40px",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            cursor: "pointer",
                        }}
                    >
                        <Box component="span">Settings</Box>
                        <ChevronRight />
                    </Stack>
                )}
                {/* <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Favorite messages</Box>
                    <ChevronRight />
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Pin chat</Box>
                    <Switch />
                </Stack> */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Mute notifications</Box>
                    <Switch
                        checked={
                            settings?.find(
                                (r) => r.key === `${constants.SETTINGS_ROOM_MUTE_PREFIX}${room.id}`
                            )?.value === constants.SETTINGS_TRUE
                        }
                        onChange={async (e) => {
                            try {
                                if (e.target.checked) {
                                    await muteRoom({ roomId: room.id });
                                } else {
                                    await unmuteRoom({ roomId: room.id });
                                }

                                dispatch(fetchSettings());
                            } catch (e: any) {
                                console.error(e);
                                showSnackBar({
                                    severity: "error",
                                    text: String(e.message),
                                });
                            }
                        }}
                    />
                </Stack>
            </Stack>
        </Box>
    );
}
