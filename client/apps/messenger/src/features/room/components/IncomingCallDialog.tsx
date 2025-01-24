import React, { useEffect } from "react";
import { Avatar, Dialog, IconButton, Stack, Typography, Paper } from "@mui/material";
import { Call, Close, Videocam, PhoneDisabled } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectIncomingCalls, closeIncomingCall } from "../slices/incomingCallDialog";
import { selectUser } from "../../../store/userSlice";
import { useAcceptCallMutation, useRejectCallMutation } from "../api/room";
import ringing from "../../../assets/ringing.mp3";
import { openCallIframe } from "../slices/callIframe";

declare const EDUMEET_URL: string;

export default function IncomingCallDialog() {
    const incomingCalls = useSelector(selectIncomingCalls);
    const me = useSelector(selectUser);

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [acceptCall] = useAcceptCallMutation();
    const [rejectCall] = useRejectCallMutation();

    const handleAcceptCall = async (enableCamera: boolean, roomId: number, roomType: string) => {
        try {
            await acceptCall({ roomId }).unwrap();
            dispatch(
                openCallIframe({
                    url: `${EDUMEET_URL}/${roomId}?displayName=${me.displayName}&headless=true&video=${enableCamera}`,
                }),
            );
            dispatch(closeIncomingCall({ roomId }));
            const rejectedCalls = incomingCalls.filter((call) => call.roomId !== roomId);
            for (const rejectedCall of rejectedCalls) {
                handleRejectCall(rejectedCall.roomId, roomType);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRejectCall = async (roomId: number, roomType: string) => {
        dispatch(closeIncomingCall({ roomId }));
        try {
            const isPrivate = roomType === "private";
            if (isPrivate) {
                await rejectCall({ roomId }).unwrap();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const iconButtonSx = {
        height: "52px",
        width: "52px",
        bgcolor: "primary.main",
        "&.MuiButtonBase-root:hover": {
            bgcolor: "primary.main",
        },
    };

    useEffect(() => {
        const groupCallIds = incomingCalls
            .filter((call) => call.roomType === "group")
            .map((call) => call.roomId);

        const timers = groupCallIds.map((roomId) =>
            setTimeout(() => {
                dispatch(closeIncomingCall({ roomId }));
            }, 30000),
        );

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [incomingCalls]);

    return (
        <Dialog
            open={incomingCalls.length > 0}
            maxWidth="lg"
            scroll="body"
            PaperProps={{ elevation: 0 }}
            sx={{
                ".MuiDialog-paper": {
                    backgroundColor: "transparent",
                    margin: 0,
                    maxWidth: "100%",
                },
            }}
        >
            {!me.privacySettings?.isCallingMuted && <audio src={ringing} loop autoPlay />}
            <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                flexWrap="wrap"
                padding="32px"
            >
                {incomingCalls.map((call) => (
                    <Paper elevation={24} sx={{ margin: "32px", borderRadius: "1rem" }}>
                        <Stack
                            p="32px"
                            pt="21px"
                            minWidth={{ xs: "100%", md: "467px" }}
                            gap="48.5px"
                        >
                            <Stack direction="row" justifyContent="space-between" gap="32px">
                                <Stack direction="row" alignItems="center" gap="8px">
                                    <Call
                                        sx={{
                                            width: "24px",
                                            height: "24px",
                                            color: "text.secondary",
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            color: "text.secondary",
                                            fontWeight: 600,
                                            fontSize: "20px",
                                        }}
                                    >
                                        {call.roomType === "group"
                                            ? t("incomingGroupCall")
                                            : t("incomingCall")}
                                    </Typography>
                                </Stack>
                                <IconButton
                                    size="large"
                                    sx={{
                                        "&.MuiButtonBase-root:hover": {
                                            bgcolor: "transparent",
                                        },
                                        p: 0,
                                    }}
                                    onClick={() => handleRejectCall(call.roomId, call.roomType)}
                                >
                                    <Close
                                        sx={{
                                            color: "text.secondary",
                                        }}
                                    />
                                </IconButton>
                            </Stack>
                            <Stack gap="8px" alignItems="center" justifyContent="center">
                                <Avatar
                                    sx={{ width: 100, height: 100 }}
                                    alt={call.displayName}
                                    src={`${UPLOADS_BASE_URL}/${call.avatarFileId}`}
                                />
                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                        fontWeight: 600,
                                        fontSize: "24px",
                                    }}
                                >
                                    {call.displayName}
                                </Typography>
                            </Stack>

                            <Stack direction="row" justifyContent="center" gap="16px">
                                <IconButton
                                    sx={iconButtonSx}
                                    onClick={() =>
                                        handleAcceptCall(false, call.roomId, call.roomType)
                                    }
                                >
                                    <Call htmlColor="white" />
                                </IconButton>
                                <IconButton
                                    sx={iconButtonSx}
                                    onClick={() =>
                                        handleAcceptCall(true, call.roomId, call.roomType)
                                    }
                                >
                                    <Videocam htmlColor="white" />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleRejectCall(call.roomId, call.roomType)}
                                    sx={{
                                        height: "52px",
                                        width: "52px",
                                        bgcolor: "#ED1B24",
                                        "&.MuiButtonBase-root:hover": {
                                            bgcolor: "#ED1B24",
                                        },
                                    }}
                                >
                                    <PhoneDisabled
                                        htmlColor="white"
                                        sx={{ transform: "rotate(90deg)" }}
                                    />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Dialog>
    );
}
