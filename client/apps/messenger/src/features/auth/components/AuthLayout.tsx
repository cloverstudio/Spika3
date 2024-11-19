import React, { useEffect } from "react";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

import logo from "../../../assets/logo.svg";
import loginBg from "../../../assets/login-bg.svg";

import { Base } from "../../../components/Base";
import useIsLoggedIn from "../../../hooks/useIsLoggedIn";
import Loader from "../../../components/Loader";
import { useNavigate } from "react-router-dom";
import { APP_NAME } from "../../../../../../lib/constants";
import { useGetUserQuery } from "../api/auth";
import { LanguagePicker } from "../../../components/LanguagePicker";

type AuthLayoutProps = {
    children: React.ReactElement | React.ReactElement[];
    setStep: (step: number) => void;
    loading?: boolean;
};

export default function AuthLayout({
    children,
    loading = false,
    setStep,
}: AuthLayoutProps): React.ReactElement {
    const { isLoggedIn } = useIsLoggedIn();
    const navigate = useNavigate();
    const { data: userData, isLoading } = useGetUserQuery();

    useEffect(() => {
        if (isLoggedIn && userData) {
            if (userData?.user.displayName) {
                navigate("/app");
            } else {
                navigate("/");
                setStep(2);
            }
        } else navigate("/");
    }, [isLoggedIn, navigate, userData]);

    if (isLoading || userData?.user.displayName) {
        return <Loader />;
    }

    return (
        <Base>
            <Box
                minHeight={{ xs: "85vh", md: "100vh" }}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems={{ xs: "center", md: "start" }}
                sx={{
                    backgroundImage: {
                        md: `url(${loginBg})`,
                    },
                    backgroundPosition: "350px",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                }}
                p={{ xs: 2, md: 8 }}
            >
                {loading ? (
                    <Box minWidth="320px" textAlign="center">
                        <img src={logo} />
                    </Box>
                ) : (
                    <Box py={2} textAlign={{ xs: "center", md: "left" }} maxWidth="350px">
                        <Box
                            mb={{ xs: 3, md: 4 }}
                            display="flex"
                            flexDirection={{ xs: "column-reverse", md: "row" }}
                            justifyContent={{ xs: "center", md: "space-between" }}
                            alignItems="center"
                            gap={{ xs: 4, md: 0 }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={logo}
                                    width={{ xs: "72px", md: "50px" }}
                                />
                                <Typography
                                    ml={1.5}
                                    display={{ xs: "none", md: "block" }}
                                    component="span"
                                    variant="body1"
                                    fontWeight="bold"
                                >
                                    {APP_NAME}
                                </Typography>
                            </Box>
                            <Box sx={{}}>
                                <LanguagePicker />
                            </Box>
                        </Box>
                        {children}
                    </Box>
                )}
            </Box>
        </Base>
    );
}
