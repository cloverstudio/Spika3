import React, { useEffect } from "react";
import { Avatar, Button, Dialog, IconButton, Stack, Typography } from "@mui/material";
import { Call, Close, Videocam } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useStopMeetMutation } from "../api/room";
import {
    selectStartMeetRoomId,
    selectStartMeetAvatarFileId,
    selectStartMeetDisplayName,
    selectStartMeetEnableCamera,
    selectIsAccepted,
} from "../slices/startMeetDialog";
import calling from "../../../assets/calling.mp3";
import { selectRoomMessages } from "../slices/messages";
import { SYSTEM_MESSAGE_TYPE_INITIATE_CALL } from "../lib/consts";
import { editMessage } from "../../../features/room/slices/messages";
import { shouldShowStartMeetDialog, closeStartMeetDialog } from "../slices/startMeetDialog";
import { selectUser } from "../../../store/userSlice";

export default function StartMeetDialog() {
    const isOpen = useSelector(shouldShowStartMeetDialog);
    const roomId = useSelector(selectStartMeetRoomId);
    const avatarFileId = useSelector(selectStartMeetAvatarFileId);
    const displayName = useSelector(selectStartMeetDisplayName);
    const enableCamera = useSelector(selectStartMeetEnableCamera);
    const isAccepted = useSelector(selectIsAccepted);
    const messages = useSelector(selectRoomMessages(roomId));
    const me = useSelector(selectUser);

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const [stopMeet] = useStopMeetMutation();

    const handleStopMeet = async () => {
        try {
            await stopMeet({ roomId }).unwrap();

            const messagesMap = new Map(Object.entries(messages));
            messagesMap.forEach((message) => {
                if (
                    message.body?.type === SYSTEM_MESSAGE_TYPE_INITIATE_CALL &&
                    message.body?.isOngoing === true
                ) {
                    const updatedMessage = {
                        ...message,
                        body: {
                            ...message.body,
                            isOngoing: false,
                        },
                    };
                    dispatch(editMessage(updatedMessage));
                }
            });
            dispatch(closeStartMeetDialog());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                handleStopMeet();
            }, 30000);

            const handleBeforeUnload = () => {
                handleStopMeet();
            };

            window.addEventListener("beforeunload", handleBeforeUnload);

            return () => {
                clearTimeout(timer);
                window.removeEventListener("beforeunload", handleBeforeUnload);
            };
        }
    }, [isOpen, messages]);

    return (
        <Dialog
            open={isOpen}
            onClose={handleStopMeet}
            maxWidth="lg"
            scroll="body"
            sx={{
                ".MuiDialog-paper": {
                    backgroundColor: "background.default",
                },
            }}
        >
            {!isAccepted && !me.privacySettings?.isCallingMuted && (
                <audio src={calling} loop autoPlay />
            )}
            <Stack p="32px" pt="21px" minWidth={{ xs: "100%", md: "467px" }}>
                <IconButton
                    size="large"
                    sx={{
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        p: 0,
                        ml: "auto",
                    }}
                    onClick={handleStopMeet}
                >
                    <Close
                        sx={{
                            color: "text.secondary",
                        }}
                    />
                </IconButton>
                <Stack direction="row" justifyContent="space-between" mt="8px">
                    {enableCamera ? (
                        <Videocam
                            sx={{
                                width: "48px",
                                height: "48px",
                                color: "text.secondary",
                            }}
                        />
                    ) : (
                        <Call
                            sx={{
                                width: "48px",
                                height: "48px",
                                color: "text.secondary",
                            }}
                        />
                    )}
                    <Stack gap="8px" alignItems="center">
                        <Avatar
                            sx={{ width: 100, height: 100 }}
                            alt={displayName}
                            src={`${UPLOADS_BASE_URL}/${avatarFileId}`}
                        />
                        <Typography sx={{ color: "text.secondary", fontWeight: 600 }}>
                            {displayName}
                        </Typography>
                    </Stack>
                </Stack>
                <Typography
                    sx={{ color: "text.secondary", fontWeight: 600, fontSize: "34px", mt: "33px" }}
                >
                    {t("calling")}
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "common.errorRed",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        fontSize: "16px",
                        mt: "24px",
                        "&:hover": {
                            backgroundColor: "common.errorRed",
                        },
                    }}
                    onClick={handleStopMeet}
                >
                    {t("stopCalling")}
                </Button>
            </Stack>
        </Dialog>
    );
}
