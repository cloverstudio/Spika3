import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";

import SnackBar from "./SnackBar";
import BasicDialog from "./BasicDialog";
import Loader from "./Loader";

import { useGetUserQuery } from "../features/auth/api/auth";

import { requestForToken } from "../firebaseInit";
import { useGetDeviceQuery, useUpdateDeviceMutation } from "../api/device";
import { addMessage } from "../features/chat/slice/chatSlice";

import { SnackbarState, SnackbarTypes } from "../types/UI";
import { dynamicBaseQuery } from "../api/api";
import { fetchHistory } from "../features/chat/slice/roomSlice";

declare const API_BASE_URL: string;

type Props = {
    children?: React.ReactNode;
};

export default function AuthBase({ children }: Props): React.ReactElement {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: user, isFetching, isLoading } = useGetUserQuery();
    const { data: deviceData, isLoading: deviceIsLoading } = useGetDeviceQuery();
    const [updateDevice] = useUpdateDeviceMutation();

    const hasPushToken = deviceData && deviceData.device.pushToken;
    useEffect(() => {
        if (!isFetching && !user) {
            navigate("/");
        }
    }, [user, isFetching, navigate]);

    useEffect(() => {
        if (!deviceIsLoading && !hasPushToken) {
            console.log("should update device");
            requestForToken(updateDevice);
        }
    }, [hasPushToken, updateDevice, deviceIsLoading]);

    useEffect(() => {
        let source: EventSource;
        if (deviceData?.device?.token && !source) {
            source = new EventSource(`${API_BASE_URL}/sse?accesstoken=${deviceData.device.token}`);

            source.onmessage = async function (event) {
                const data = event.data ? JSON.parse(event.data) : {};
                if (data && data.message) {
                    await dynamicBaseQuery({
                        url: "/messenger/messages/delivered",
                        method: "POST",
                        data: { messagesIds: [data.message.id] },
                    });
                    dispatch(addMessage(data.message));
                    dispatch(fetchHistory(1));
                }
            };
        }

        return () => {
            source && source.close();
        };
    }, [deviceData?.device?.token, dispatch]);

    useEffect(() => {
        const handleKeyDown = (ev: KeyboardEvent) => {
            if (ev.altKey && ev.key === "o") {
                window.localStorage.removeItem("access-token");
                navigate("/");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [navigate]);

    if (isLoading) {
        return <Loader />;
    }

    if (!user) {
        return null;
    }

    return <Base>{children}</Base>;
}

export function Base({ children }: Props): React.ReactElement {
    const [snackbarState, setSnackbarState] = useState<SnackbarState>({
        show: false,
        message: "",
        type: SnackbarTypes.info,
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}

            <SnackBar />
            <BasicDialog />
        </ThemeProvider>
    );
}
