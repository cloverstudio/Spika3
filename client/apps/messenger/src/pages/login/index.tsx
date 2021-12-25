import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    FormLabel,
    Box,
    Typography,
    Link,
    InputBase,
} from "@mui/material";
import logo from "../../assets/logo.svg";
import loginBg from "../../assets/login-bg.svg";

import { useSelector, useDispatch } from "react-redux";
import Loader from "../../components/Loader";
import Base from "../../components/Base";
import { useSignUpMutation, useVerifyMutation } from "../../api/auth";

export default function LoginPage(): React.ReactElement {
    const history = useHistory();
    const [telephoneNumber, setTelephoneNumber] = useState("");
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
    const [signUp, signUpMutation] = useSignUpMutation();
    const [verify, verifyMutation] = useVerifyMutation();
    const handleSubmit = () => {
        const telephoneNumberHashed = "hahahahahahahahaah";

        signUp({ telephoneNumber, deviceId: "111111111111", telephoneNumberHashed });
    };

    const tryToSubmit = () => {
        const emptyIndex = codeArr.findIndex((c) => !c.value);

        if (emptyIndex > -1) {
            return codeArr[emptyIndex].ref.current.focus();
        }

        const verificationCode = codeArr.map((c) => c.value).join("");
        const deviceId = "111111111111";

        verify({ verificationCode, deviceId });
    };

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
                        {/* <FormLabel sx={{ mb: 1.5, display: "block" }}>Phone number</FormLabel>
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
                        /> */}

                        <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography component="span" variant="body1" fontWeight="medium">
                                    02:00
                                </Typography>
                                <Link
                                    fontWeight="bold"
                                    underline="hover"
                                    href="/login"
                                    variant="body1"
                                >
                                    Resend code
                                </Link>
                            </Box>
                            <Box
                                display="grid"
                                gap={1}
                                gridTemplateColumns="repeat(6, 1fr)"
                                justifyContent="space-between"
                            >
                                {codeArr.map((c, i) => {
                                    return (
                                        <NumberInput
                                            key={i}
                                            value={c.value}
                                            inputRef={c.ref}
                                            handleChange={(value) => {
                                                const isDelete = !value;

                                                if (!isDelete && value.length > 1) {
                                                    return;
                                                }

                                                const newArr = [...codeArr];
                                                newArr.splice(i, 1, { ...codeArr[i], value });
                                                setCodeArr(newArr);

                                                if (i < 5 && !isDelete) {
                                                    newArr[i + 1].ref.current.focus();
                                                } else if (i === 5 && !isDelete) {
                                                    tryToSubmit();
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>

                        {/* <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    /> */}
                        <Button
                            onClick={handleSubmit}
                            disabled={telephoneNumber.length === 0}
                            fullWidth
                            variant="contained"
                        >
                            Next
                        </Button>
                    </Box>
                    <Link fontWeight="bold" underline="hover" href="/login" variant="body1">
                        Already have an account? Log in
                    </Link>
                </Box>
            </Box>
        </Base>
    );
}

function NumberInput({
    value,
    handleChange,
    inputRef,
}: {
    value: string;
    handleChange: (v: string) => void;
    inputRef: React.MutableRefObject<any>;
}): React.ReactElement {
    return (
        <Box>
            <InputBase
                type="number"
                inputProps={{
                    ref: inputRef,
                }}
                value={value}
                onChange={({ target }) => {
                    //target.value && target.blur();
                    handleChange(target.value);
                }}
                sx={{
                    input: {
                        border: "1px solid #9AA0A6",
                        borderRadius: "10px",
                        height: "100%",
                        padding: "5px",
                        textAlign: "center",
                        color: "#141414",
                        fontWeight: "bold",
                        fontSize: "28px",
                        lineHeight: "34px",
                        "&::-webkit-outer-spin-button": {
                            margin: "0",
                            WebkitAppearance: "none",
                        },
                        "&::-webkit-inner-spin-button": {
                            margin: "0",
                            WebkitAppearance: "none",
                        },
                        "&[type=number]": {
                            margin: "0",
                            WebkitAppearance: "textfield",
                        },
                    },
                }}
            />
        </Box>
    );
}
