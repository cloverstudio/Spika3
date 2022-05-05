import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";

import SnackBar from "./SnackBar";
import BasicDialog from "./BasicDialog";
import Loader from "./Loader";

import { useGetUserQuery } from "../api/auth";

import { requestForToken } from "../firebaseInit";
import { useGetDeviceQuery, useUpdateDeviceMutation } from "../api/device";
import { addMessage } from "../features/chat/slice/chatSlice";
import roomApi from "../features/chat/api/room";

import { SnackbarState, SnackbarTypes } from "../types/UI";
import { dynamicBaseQuery } from "../api/api";

declare const API_BASE_URL: string;

type Props = {
    children?: React.ReactNode;
};

export const AuthContext = createContext({ user: null });

export default function AuthBase({ children }: Props): React.ReactElement {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: user, isFetching } = useGetUserQuery();
    const device = useGetDeviceQuery();
    const [updateDevice] = useUpdateDeviceMutation();

    const hasPushToken = device.data && device.data.device.pushToken;

    useEffect(() => {
        if (!isFetching && !user) {
            navigate("/");
        }
    }, [user, isFetching, navigate]);

    useEffect(() => {
        if (!hasPushToken) {
            requestForToken(updateDevice);
        }
    }, [hasPushToken, updateDevice]);

    useEffect(() => {
        let source: EventSource;
        if (device.data?.device?.token && !source) {
            source = new EventSource(`${API_BASE_URL}/sse?accesstoken=${device.data.device.token}`);

            source.onmessage = async function (event) {
                const data = event.data ? JSON.parse(event.data) : {};
                if (data && data.message) {
                    await dynamicBaseQuery({
                        url: "/messenger/messages/delivered",
                        method: "POST",
                        data: { messagesIds: [data.message.id] },
                    });
                    dispatch(addMessage(data.message));

                    setTimeout(() => dispatch(roomApi.endpoints.getHistory.initiate(1)), 500);
                }
            };
        }

        return () => {
            source && source.close();
        };
    }, [device.data?.device?.token, dispatch]);

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

    if (isFetching) {
        return <Loader />;
    }

    if (!user) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user }}>
            <Base>{children}</Base>
        </AuthContext.Provider>
    );
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
