import React, { useEffect } from "react";
import { Avatar, Button, Dialog, IconButton, Stack, Typography } from "@mui/material";
import { Call, Close, Videocam } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useStopCallMutation } from "../api/room";
import {
    selectStartCallRoomId,
    selectStartCallAvatarFileId,
    selectStartCallDisplayName,
    selectStartCallEnableCamera,
    selectIsAccepted,
} from "../slices/startCallDialog";
import calling from "../../../assets/calling.mp3";
import { selectRoomMessages } from "../slices/messages";
import { SYSTEM_MESSAGE_TYPE_INITIATE_CALL } from "../lib/consts";
import { editMessage } from "../slices/messages";
import { shouldShowStartCallDialog, closeStartCallDialog } from "../slices/startCallDialog";
import { selectUser } from "../../../store/userSlice";

export default function StartCallDialog() {
    const isOpen = useSelector(shouldShowStartCallDialog);
    const roomId = useSelector(selectStartCallRoomId);
    const avatarFileId = useSelector(selectStartCallAvatarFileId);
    const displayName = useSelector(selectStartCallDisplayName);
    const enableCamera = useSelector(selectStartCallEnableCamera);
    const isAccepted = useSelector(selectIsAccepted);
    const messages = useSelector(selectRoomMessages(roomId));
    const me = useSelector(selectUser);

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const [stopCall] = useStopCallMutation();

    const handleStopCall = async () => {
        try {
            await stopCall({ roomId }).unwrap();

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
            dispatch(closeStartCallDialog());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                handleStopCall();
            }, 30000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [isOpen, handleStopCall]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener("beforeunload", handleStopCall);

            return () => {
                window.removeEventListener("beforeunload", handleStopCall);
            };
        }
    }, [isOpen]);

    return (
        <Dialog
            open={isOpen}
            onClose={handleStopCall}
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
                    onClick={handleStopCall}
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
                    onClick={handleStopCall}
                >
                    {t("stopCalling")}
                </Button>
            </Stack>
        </Dialog>
    );
}
