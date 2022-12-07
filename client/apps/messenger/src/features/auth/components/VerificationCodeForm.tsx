import React, { useRef, useState, useEffect } from "react";
import { Button, Box, Typography, Link, Alert, AlertTitle } from "@mui/material";
import PinInput from "./PinInput";
import CountdownTimer from "./CountdownTimer";
import useStrings from "../../../hooks/useStrings";

type VerificationCodeFormProps = {
    onSubmit: (verificationCode: string) => void;
    onResend: () => void;
    onBack: () => void;
    telephoneNumber: string;
    timeLeft: number;
    error?: any;
    info?: string;
};

export default function VerificationCodeForm({
    onSubmit,
    onResend,
    onBack,
    telephoneNumber,
    error,
    timeLeft,
    info,
}: VerificationCodeFormProps): React.ReactElement {
    const strings = useStrings();
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
        if (!timeLeft) {
            return;
        }

        const emptyIndex = codeArr.findIndex((c) => !c.value);

        if (emptyIndex > -1) {
            return codeArr[emptyIndex].ref.current.focus();
        }

        const verificationCode = codeArr.map((c) => c.value).join("");

        onSubmit(verificationCode);
    };

    useEffect(() => {
        if (codeArr.every((o) => !!o.value)) {
            tryToSubmit();
        }
    }, [codeArr]);

    useEffect(() => {
        refs[0].current?.focus();
    }, []);

    const codeFilled = codeArr.every((o) => !!o.value);
    const someCodeEntered = codeArr.some((o) => !!o.value);

    return (
        <>
            <Typography
                display={{ xs: "none", md: "block" }}
                mb={3}
                component="h1"
                variant="h3"
                fontWeight="bold"
            >
                {strings.welcome}
            </Typography>

            <Typography
                component="p"
                variant="body1"
                mx={{ xs: "auto", md: 0 }}
                maxWidth={{ xs: "220px", md: "none" }}
                mb={{ xs: error ? 1 : 5, md: error ? 4 : 10 }}
                fontWeight="medium"
            >
                {strings.sentVerificationCode} {telephoneNumber}!
            </Typography>
            {error.length > 0 && !someCodeEntered && info.length === 0 && (
                <Alert sx={{ mb: 4 }} severity="error">
                    <AlertTitle sx={{ mb: 0 }}>{error}</AlertTitle>
                </Alert>
            )}
            {info.length > 0 && (
                <Alert sx={{ mb: 4 }} severity="info">
                    <Typography component="span" fontSize="1.0rem" color="inherit">
                        {info}
                    </Typography>
                </Alert>
            )}
            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <CountdownTimer timeLeft={timeLeft} />
                    </Box>
                    <PinInput
                        setCodeArr={setCodeArr}
                        codeArr={codeArr}
                        handleSubmit={tryToSubmit}
                    />
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Link
                            fontWeight="bold"
                            underline="hover"
                            sx={{ cursor: "pointer" }}
                            onClick={onBack}
                            variant="body1"
                            textTransform="capitalize"
                        >
                            {strings.back}
                        </Link>
                        <Link
                            fontWeight="bold"
                            underline="hover"
                            sx={{ cursor: "pointer" }}
                            onClick={() => {
                                onResend();
                            }}
                            variant="body1"
                        >
                            {strings.resendCode}
                        </Link>
                    </Box>
                </Box>
                <Button
                    onClick={tryToSubmit}
                    disabled={!codeFilled || !timeLeft}
                    fullWidth
                    variant="contained"
                >
                    {strings.next}
                </Button>
            </Box>
        </>
    );
}
