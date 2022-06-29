import React, { useEffect, useState, useRef } from "react";
import { Box, Grid, useMediaQuery, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import {
    Close as CloseIcon,
    Videocam as VideocamIcon,
    VideocamOff as VideocamOffIcon,
    Mic as MicIcon,
    MicOff as MicOffIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";

import { RootState } from "../../store/store";
import * as Constants from "../../../../../lib/constants";
import { useShowSnackBar } from "../../hooks/useModal";
import { callEventPayload } from "../../types/confcall";
import { listen as listenCallEvent } from "./lib/callEventListener";

//API
import { useJoinMutation, useLeaveMutation } from "./api";

export default function ConfCall() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const callState = useSelector((state: RootState) => state.call);

    const [joinApi] = useJoinMutation();
    const [leaveApi] = useLeaveMutation();

    // called when component is ready
    useEffect(() => {
        (async () => {
            await joinApi(callState.roomId);
        })();

        const clearListner = listenCallEvent((data: callEventPayload) => {
            console.log("call event", data);
        });

        return () => {
            clearListner();
        };
    }, []);

    return (
        <Box
            sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "common.confCallBackground",
                border: "none",
                zIndex: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <CloseIcon
                sx={{
                    position: "absolute",
                    top: 15,
                    right: 15,
                    cursor: "pointer",
                    color: "common.confCallControls",
                }}
                fontSize="large"
                onClick={async () => {
                    await leaveApi(callState.roomId);
                    navigate(`/rooms/${callState.roomId}`);
                }}
            />
        </Box>
    );
}
