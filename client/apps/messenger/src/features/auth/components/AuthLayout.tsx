import React from "react";
import { Box, Typography } from "@mui/material";

import logo from "../../../assets/logo.svg";
import loginBg from "../../../assets/login-bg.svg";

import { Base } from "../../../components/Base";

type AuthLayoutProps = {
    children: React.ReactElement | React.ReactElement[];
    loading?: boolean;
};

export default function AuthLayout({
    children,
    loading = false,
}: AuthLayoutProps): React.ReactElement {
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
                            justifyContent={{ xs: "center", md: "left" }}
                            alignItems="center"
                        >
                            <Box component="img" src={logo} width={{ xs: "72px", md: "50px" }} />
                            <Typography
                                ml={1.5}
                                display={{ xs: "none", md: "block" }}
                                component="span"
                                variant="body1"
                                fontSize="1.15rem"
                                fontWeight="bold"
                            >
                                Spika
                            </Typography>
                        </Box>

                        {children}
                    </Box>
                )}
            </Box>
        </Base>
    );
}
