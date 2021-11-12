import React, { useState, useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import faker from "faker";
import { useGet, usePut } from "../../lib/useApi";

import {
    TextField,
    Paper,
    Grid,
    Button,
    Stack,
    FormGroup,
    FormControl,
    FormControlLabel,
    Checkbox,
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useShowSnackBar } from "../../components/useUI";
import { User } from "@prisma/client";
import { formItem, formItems } from "./types";

function validateEmail(email: any) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default function Page() {
    const urlParams: { id: string } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();
    const showSnackBar = useShowSnackBar();
    const [detail, setDetail] = React.useState<User>();
    const [forms, setForms] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
        phoneNumber: {
            value: "",
            isError: false,
            helperText: "",
        },
        countryCode: {
            value: "",
            isError: false,
            helperText: "",
        },
        email: {
            value: "",
            isError: false,
            helperText: "",
        },
        avatarUrl: {
            value: "",
            isError: false,
            helperText: "",
        },
        verified: {
            value: "",
            isError: false,
            helperText: "",
        },
        verificationCode: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [verified, setVerified] = React.useState<boolean>(false);

    const get = useGet();
    const put = usePut();

    useEffect(() => {
        (async () => {
            try {
                const response: User = await get(`/api/management/user/${urlParams.id}`);
                setDetail(response);
                const checkName = response.displayName == null ? "" : response.displayName;
                const checkCC = response.countryCode == null ? "" : response.countryCode;
                const checkPhone = response.telephoneNumber == null ? "" : response.telephoneNumber;
                const checkEmail = response.emailAddress == null ? "" : response.emailAddress;
                const checkUrl = response.avatarUrl == null ? "" : response.avatarUrl;
                const checkVer = response.verified == null ? false : response.verified;
                const checkVerCode =
                    response.verificationCode == null ? "" : response.verificationCode;

                setForms({
                    displayName: {
                        value: checkName,
                        isError: false,
                        helperText: "",
                    },
                    phoneNumber: {
                        value: checkPhone,
                        isError: false,
                        helperText: "",
                    },
                    countryCode: {
                        value: checkCC,
                        isError: false,
                        helperText: "",
                    },
                    email: {
                        value: checkEmail,
                        isError: false,
                        helperText: "",
                    },
                    avatarUrl: {
                        value: checkUrl,
                        isError: false,
                        helperText: "",
                    },
                    verified: {
                        value: String(checkVer),
                        isError: false,
                        helperText: "",
                    },
                    verificationCode: {
                        value: checkVerCode,
                        isError: false,
                        helperText: "",
                    },
                });

                setVerified(checkVer);
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Server error, please check browser console.",
                });
            }
        })();
    }, []);

    const validateAndUpdate = async () => {
        let hasError = false;

        const newItems: formItems = { ...forms };
        newItems.displayName.isError = false;
        newItems.displayName.helperText = "";
        newItems.countryCode.isError = false;
        newItems.countryCode.helperText = "";
        newItems.phoneNumber.isError = false;
        newItems.phoneNumber.helperText = "";
        newItems.email.isError = false;
        newItems.email.helperText = "";
        newItems.avatarUrl.isError = false;
        newItems.avatarUrl.helperText = "";

        if (forms.displayName.value.length == 0) {
            forms.displayName.isError = true;
            forms.displayName.helperText = "Please input display name";
            hasError = true;
        }

        if (forms.countryCode.value.length == 0) {
            forms.countryCode.isError = true;
            forms.countryCode.helperText = "Please input code";
            hasError = true;
        }

        if (forms.phoneNumber.value.length == 0) {
            forms.phoneNumber.isError = true;
            forms.phoneNumber.helperText = "Please input phone number";
            hasError = true;
        }

        // if (validateEmail(forms.email.value.length)) {
        //     forms.email.isError = true;
        //     forms.email.helperText = "Please input display name";
        //     hasError = true;
        // }

        // if (forms.avatarUrl.value.length == 0) {
        //     forms.avatarUrl.isError = true;
        //     forms.avatarUrl.helperText = "Please input display name";
        //     hasError = true;
        // }

        if (!hasError) {
            try {
                const result = await put(`/api/management/user/${urlParams.id}`, {
                    displayName: forms.displayName.value,
                    emailAddress: forms.email.value,
                    countryCode: forms.countryCode.value,
                    telephoneNumber: forms.phoneNumber.value,
                    avatarUrl: forms.avatarUrl.value,
                    verified: verified,
                    verificationCode: forms.verificationCode.value,
                });

                showSnackBar({ severity: "success", text: "User updated" });
                history.push("/user");
                newItems.displayName.value = "";
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Failed to update user, please check console.",
                });
            }
        }

        setForms(newItems);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVerified(event.target.checked);
    };

    return (
        <Layout subtitle={`User detail ( ${urlParams.id} )`} showBack={true}>
            <Paper
                sx={{
                    margin: "24px",
                    padding: "24px",
                    minHeight: "calc(100vh-64px)",
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.displayName.isError}
                            label="Display Name"
                            value={forms.displayName.value}
                            onChange={(e) => {
                                forms.displayName.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Stack alignItems="center" spacing={1} direction="row">
                            <TextField
                                required
                                error={forms.countryCode.isError}
                                label="Country code"
                                value={forms.countryCode.value}
                                onChange={(e) => {
                                    forms.countryCode.value = e.target.value;
                                    setForms({ ...forms });
                                }}
                                helperText={forms.countryCode.helperText}
                            />
                            <TextField
                                required
                                fullWidth
                                error={forms.phoneNumber.isError}
                                label="Phone number"
                                value={forms.phoneNumber.value}
                                onChange={(e) => {
                                    forms.phoneNumber.value = e.target.value;
                                    setForms({ ...forms });
                                }}
                                helperText={forms.phoneNumber.helperText}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            error={forms.email.isError}
                            label="E-mail"
                            value={forms.email.value}
                            onChange={(e) => {
                                forms.email.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.email.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            error={forms.avatarUrl.isError}
                            label="Avatar URL"
                            value={forms.avatarUrl.value}
                            onChange={(e) => {
                                forms.avatarUrl.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.avatarUrl.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Verification Code"
                            value={forms.verificationCode.value}
                            onChange={(e) => {
                                forms.verificationCode.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.avatarUrl.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <FormControl component="fieldset">
                            <FormGroup aria-label="position" row>
                                <FormControlLabel
                                    value="start"
                                    control={
                                        <Checkbox checked={verified} onChange={handleChange} />
                                    }
                                    label="Verified"
                                    labelPlacement="start"
                                />
                            </FormGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8} textAlign="right">
                        <Button
                            variant="contained"
                            onClick={(e) => {
                                validateAndUpdate();
                            }}
                        >
                            Update user
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Layout>
    );
}
