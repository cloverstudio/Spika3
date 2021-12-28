import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, TextField, FormLabel, Box, Typography, Link } from "@mui/material";
import logo from "../../assets/logo.svg";
import loginBg from "../../assets/login-bg.svg";

import { useSelector, useDispatch } from "react-redux";
import Base from "../../components/Base";
import { useSignUpMutation, useVerifyMutation } from "../../api/auth";
import PinInput from "../../components/PinInput";
import CountdownTimer from "../../components/CountdownTimer";
import useDeviceId from "../../hooks/useDeviceId";
import { sha256 } from "../../../../../lib/utils";

export default function SignUpPage(): React.ReactElement {
    const history = useHistory();
    const deviceId = useDeviceId();
    const [signUp, signUpMutation] = useSignUpMutation();
    const [verify, verifyMutation] = useVerifyMutation();

    const handleSignUp = (telephoneNumber: string) => {
        signUp({ telephoneNumber, telephoneNumberHashed: sha256(telephoneNumber), deviceId });
    };

    useEffect(() => {
        console.log({ verifyMutation });

        if (verifyMutation.isSuccess) {
            console.log({ data: verifyMutation.data });
        }
    }, [verifyMutation]);

    const handleVerify = (code: string) => {
        console.log({ code, deviceId });
        verify({ code, deviceId });
    };

    return (
        <AuthLayout loading={signUpMutation.isLoading || verifyMutation.isLoading}>
            {signUpMutation.isSuccess ? (
                <VerificationCodeForm
                    onSubmit={handleVerify}
                    telephoneNumber={signUpMutation.data?.user.telephoneNumber}
                    error={verifyMutation.error}
                />
            ) : (
                <TelephoneNumberForm onSubmit={handleSignUp} />
            )}

            <Link fontWeight="bold" underline="hover" href="/login" variant="body1">
                Already have an account? Log in
            </Link>
        </AuthLayout>
    );
}

type AuthLayoutProps = {
    children: React.ReactElement[];
    loading?: boolean;
};

function AuthLayout({ children, loading = false }: AuthLayoutProps) {
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
                        <Typography
                            display={{ xs: "none", md: "block" }}
                            mb={3}
                            component="h1"
                            variant="h3"
                            fontWeight="bold"
                        >
                            Welcome!
                        </Typography>

                        {children}
                    </Box>
                )}
            </Box>
        </Base>
    );
}

type TelephoneNumberFormProps = {
    onSubmit: (telephoneNumber: string) => void;
};

function TelephoneNumberForm({ onSubmit }: TelephoneNumberFormProps) {
    const [telephoneNumber, setTelephoneNumber] = useState("");

    return (
        <>
            <Typography
                component="p"
                variant="body1"
                mx={{ xs: "auto", md: 0 }}
                maxWidth={{ xs: "220px", md: "none" }}
                mb={{ xs: 5, md: 10 }}
                fontWeight="medium"
            >
                Enter your phone number to start using Spika
            </Typography>
            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                <FormLabel sx={{ mb: 1.5, display: "block" }}>Phone number</FormLabel>
                <TextField
                    sx={{ mb: 3 }}
                    required
                    fullWidth
                    id="telephone"
                    placeholder="Eg. 98726546"
                    name="telephoneNumber"
                    autoComplete="telephone"
                    autoFocus
                    value={telephoneNumber}
                    onChange={({ target }) => setTelephoneNumber(target.value)}
                />
                <Button
                    onClick={() => onSubmit(telephoneNumber)}
                    disabled={telephoneNumber.length === 0}
                    fullWidth
                    variant="contained"
                >
                    Next
                </Button>
            </Box>
        </>
    );
}

type VerificationCodeFormProps = {
    onSubmit: (verificationCode: string) => void;
    telephoneNumber: string;
    error?: unknown;
};

function VerificationCodeForm({ onSubmit, telephoneNumber, error }: VerificationCodeFormProps) {
    const refs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];
    const [codeArr, setCodeArr] = useState(
        Array(6)
            .fill(true)
            .map((_, i) => ({ ref: refs[i], value: "" }))
    );

    const tryToSubmit = () => {
        const emptyIndex = codeArr.findIndex((c) => !c.value);

        if (emptyIndex > -1) {
            return codeArr[emptyIndex].ref.current.focus();
        }

        const verificationCode = codeArr.map((c) => c.value).join("");

        onSubmit(verificationCode);
    };

    const codeFilled = codeArr.every((o) => !!o.value);

    return (
        <>
            <Typography
                component="p"
                variant="body1"
                mx={{ xs: "auto", md: 0 }}
                maxWidth={{ xs: "220px", md: "none" }}
                mb={{ xs: 5, md: 10 }}
                fontWeight="medium"
            >
                We sent you verification code on {telephoneNumber}!
            </Typography>
            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                {error && <Box>{error?.message}</Box>}
                <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <CountdownTimer onDone={() => console.log("Done")} />
                        <Link fontWeight="bold" underline="hover" href="/login" variant="body1">
                            Resend code
                        </Link>
                    </Box>
                    <PinInput onSubmit={tryToSubmit} setCodeArr={setCodeArr} codeArr={codeArr} />
                </Box>
                <Button onClick={tryToSubmit} disabled={!codeFilled} fullWidth variant="contained">
                    Next
                </Button>
            </Box>
        </>
    );
}
