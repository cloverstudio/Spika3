import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";

import SnackBar from "@/components/SnackBar";
import BasicDialog from "@/components/BasicDialog";
import Loader from "@/components/Loader";

import { lightTheme, darkTheme, ThemeType, ThemeContext } from "@lib/theme";
import * as constants from "@lib/constants";
import useIsLoggedIn from "@/hooks/useIsLoggedIn";

type Props = {
    children?: React.ReactNode;
};

export default function AuthBase({ children }: Props): React.ReactElement {
    const navigate = useNavigate();
    const { isLoggedIn, loading } = useIsLoggedIn();
    console.log({ isLoggedIn, loading });
    useEffect(() => {
        const handleKeyDown = (ev: KeyboardEvent) => {
            if (ev.ctrlKey && ev.key === "o") {
                ev.preventDefault();
                window.localStorage.removeItem(constants.ADMIN_ACCESS_TOKEN);
                navigate("/login");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [navigate]);

    useEffect(() => {
        if (!loading && !isLoggedIn) {
            navigate("/login");
        }
    }, [isLoggedIn, navigate, loading]);

    if (loading) {
        return (
            <Base>
                <Loader />
            </Base>
        );
    }

    if (!isLoggedIn) {
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
