import React, { useRef, useState, useEffect } from "react";
import { Button, Box, Typography, Link } from "@mui/material";
import PinInput from "./PinInput";
import CountdownTimer from "./CountdownTimer";

type VerificationCodeFormProps = {
    onSubmit: (verificationCode: string) => void;
    onResend: () => void;
    telephoneNumber: string;
    error?: unknown;
};

export default function VerificationCodeForm({
    onSubmit,
    onResend,
    telephoneNumber,
    error,
}: VerificationCodeFormProps): React.ReactElement {
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
    const [timerExpired, setTimerExpired] = useState(false);

    const tryToSubmit = () => {
        if (timerExpired) {
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

    const codeFilled = codeArr.every((o) => !!o.value);

    return (
        <>
            <Typography
                display={{ xs: "none", md: "block" }}
                mb={3}
                component="h1"
                variant="h3"
                fontWeight="bold"
            >
                Welcome!
            </Typography>

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
                {error && <Box>Error</Box>}
                <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <CountdownTimer value={60} onDone={() => setTimerExpired(true)} />
                        <Link
                            fontWeight="bold"
                            underline="hover"
                            sx={{ cursor: "pointer" }}
                            onClick={onResend}
                            variant="body1"
                        >
                            Resend code
                        </Link>
                    </Box>
                    <PinInput setCodeArr={setCodeArr} codeArr={codeArr} />
                </Box>
                <Button
                    onClick={tryToSubmit}
                    disabled={!codeFilled || timerExpired}
                    fullWidth
                    variant="contained"
                >
                    Next
                </Button>
            </Box>
        </>
    );
}
