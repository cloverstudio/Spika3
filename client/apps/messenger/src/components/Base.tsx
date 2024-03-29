import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";

import { lightTheme, darkTheme, ThemeType, ThemeContext } from "../theme";

import SnackBar from "./SnackBar";
import BasicDialog from "./BasicDialog";
import Loader from "./Loader";

import { useGetUserQuery } from "../features/auth/api/auth";

import { useGetDeviceQuery, useUpdateDeviceMutation } from "../api/device";

import handleSSE from "../utils/handleSSE";
import * as constants from "../../../../lib/constants";

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
        let source: EventSource;
        if (deviceData?.device?.token && !source) {
            source = new EventSource(`${API_BASE_URL}/sse?accesstoken=${deviceData.device.token}`);

            source.onmessage = handleSSE;
        }

        return () => {
            source && source.close();
        };
    }, [deviceData?.device?.token, dispatch]);

    useEffect(() => {
        const handleKeyDown = (ev: KeyboardEvent) => {
            if (ev.ctrlKey && ev.key === "o") {
                ev.preventDefault();
                window.localStorage.removeItem(constants.LSKEY_ACCESSTOKEN);
                window.localStorage.removeItem(constants.LSKEY_DEVICEID);
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

const initialTheme: ThemeType =
    (window.localStorage.getItem(constants.LSKEY_THEME) as ThemeType) || "light";

export function Base({ children }: Props): React.ReactElement {
    const [theme, setTheme] = useState<ThemeType>(initialTheme);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
                <div className={theme === "light" ? "light" : "dark"}>
                    <CssBaseline />
                    {children}
                    <SnackBar />
                    <BasicDialog />
                </div>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}
