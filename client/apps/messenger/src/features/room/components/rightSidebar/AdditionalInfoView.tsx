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
import useStrings from "../../../../hooks/useStrings";

export interface Props {
    roomData: RoomType;
}

export function DetailsAdditionalInfoView(props: Props) {
    const strings = useStrings();
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
                spacing={3}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingTop: 5.5,
                }}
            >
                {/* <Stack
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
                    <Box component="span">Shared Media, Links and Docs</Box>
                    <ChevronRight />
                </Stack>

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
                    <Box component="span">Call history</Box>
                    <ChevronRight />
                </Stack> */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={() => dispatch(setActiveTab("notes"))}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        cursor: "pointer",
                    }}
                >
                    <Box component="span">{strings.notes}</Box>
                    <ChevronRight />
                </Stack>
                {((type === "group" && userIsAdmin) || type === "private") && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={() => dispatch(setActiveTab("settings"))}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            cursor: "pointer",
                        }}
                    >
                        <Box component="span">{strings.settings}</Box>
                        <ChevronRight />
                    </Stack>
                )}
                {/* <Stack
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
                    <Box component="span">Favorite messages</Box>
                    <ChevronRight />
                </Stack>
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
                    <Box component="span">Pin chat</Box>
                    <Switch />
                </Stack> */}
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
                    <Box component="span">{strings.muteNotifications}</Box>
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
