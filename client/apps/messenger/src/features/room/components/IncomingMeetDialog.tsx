import React, { useEffect } from "react";
import { Avatar, Dialog, IconButton, Stack, Typography, Paper } from "@mui/material";
import { Call, Close, Videocam, PhoneDisabled } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectIncomingMeets, closeIncomingMeet } from "../slices/incomingMeetDialog";
import { selectUser } from "../../../store/userSlice";
import { useAcceptMeetMutation, useRejectMeetMutation } from "../api/room";
import ringing from "../../../assets/ringing.mp3";
import { openMeetIframe } from "../slices/meetIframe";

declare const EDUMEET_URL: string;

export default function IncomingMeetDialog() {
    const incomingMeets = useSelector(selectIncomingMeets);
    const me = useSelector(selectUser);

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [acceptMeet] = useAcceptMeetMutation();
    const [rejectMeet] = useRejectMeetMutation();

    const handleAcceptMeet = async (enableCamera: boolean, roomId: number, roomType: string) => {
        try {
            await acceptMeet({ roomId }).unwrap();
            dispatch(
                openMeetIframe({
                    url: `${EDUMEET_URL}/${roomId}?displayName=${me.displayName}&headless=true&video=${enableCamera}`,
                }),
            );
            dispatch(closeIncomingMeet({ roomId }));
            const rejectedMeets = incomingMeets.filter((meet) => meet.roomId !== roomId);
            for (const rejectedMeet of rejectedMeets) {
                handleRejectMeet(rejectedMeet.roomId, roomType);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRejectMeet = async (roomId: number, roomType: string) => {
        try {
            const isPrivate = roomType === "private";
            if (isPrivate) {
                await rejectMeet({ roomId }).unwrap();
            }
            dispatch(closeIncomingMeet({ roomId }));
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
        const groupMeetIds = incomingMeets
            .filter((meet) => meet.roomType === "group")
            .map((meet) => meet.roomId);

        const timers = groupMeetIds.map((roomId) =>
            setTimeout(() => {
                dispatch(closeIncomingMeet({ roomId }));
            }, 30000),
        );

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [incomingMeets]);

    return (
        <Dialog
            open={incomingMeets.length > 0}
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
            {!me.privacySettings.isCallingMuted && <audio src={ringing} loop autoPlay />}
            <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                flexWrap="wrap"
                padding="32px"
            >
                {incomingMeets.map((meet) => (
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
                                        {meet.roomType === "group"
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
                                    onClick={() => handleRejectMeet(meet.roomId, meet.roomType)}
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
                                    alt={meet.displayName}
                                    src={`${UPLOADS_BASE_URL}/${meet.avatarFileId}`}
                                />
                                <Typography
                                    sx={{
                                        color: "text.secondary",
                                        fontWeight: 600,
                                        fontSize: "24px",
                                    }}
                                >
                                    {meet.displayName}
                                </Typography>
                            </Stack>

                            <Stack direction="row" justifyContent="center" gap="16px">
                                <IconButton
                                    sx={iconButtonSx}
                                    onClick={() =>
                                        handleAcceptMeet(false, meet.roomId, meet.roomType)
                                    }
                                >
                                    <Call htmlColor="white" />
                                </IconButton>
                                <IconButton
                                    sx={iconButtonSx}
                                    onClick={() =>
                                        handleAcceptMeet(true, meet.roomId, meet.roomType)
                                    }
                                >
                                    <Videocam htmlColor="white" />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleRejectMeet(meet.roomId, meet.roomType)}
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
