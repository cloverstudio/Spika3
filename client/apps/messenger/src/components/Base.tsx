import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import theme from "../theme";

import SnackBar from "./SnackBar";
import BasicDialog from "./BasicDialog";
import Loader from "./Loader";

import { useGetUserQuery } from "../features/auth/api/auth";

import { useGetDeviceQuery } from "../api/device";

import handleSSE from "../utils/handleSSE";
import * as constants from "../../../../lib/constants";

declare const API_BASE_URL: string;

type Props = {
    children?: React.ReactNode;
};

async function checkPermission() {
    if (Notification.permission !== "granted") {
        // ask for permission
    }
}

export default function AuthBase({ children }: Props): React.ReactElement {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: user, isFetching, isLoading } = useGetUserQuery();
    const { data: deviceData } = useGetDeviceQuery();

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

export function Base({ children }: Props): React.ReactElement {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
            <SnackBar />
            <BasicDialog />
        </ThemeProvider>
    );
}
