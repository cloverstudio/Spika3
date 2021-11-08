import React, { useState, useEffect } from "react";
import Layout from "../layout";
import { useHistory } from "react-router-dom";
import faker from "faker";
import { usePost } from "../../lib/useApi";

import {
    TextField,
    Paper,
    Grid,
    Button,
    Stack,
    Checkbox,
    FormGroup,
    FormControl,
    FormControlLabel,
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useShowSnackBar } from "../../components/useUI";
import { formItem, formItems } from "./types";

function validateEmail(email: any) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default function Dashboard() {
    const dispatch = useDispatch();
    const history = useHistory();
    const showSnackBar = useShowSnackBar();
    const [name, setName] = React.useState<string>("");
    const [forms, setForms] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [countryCode, setCountryCode] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [phoneNumber, setPhoneNumber] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [email, setEmail] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [avatarUrl, setAvatarUrl] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [verified, setVerified] = React.useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVerified(event.target.checked);
    };

    const post = usePost();

    const validateAndAdd = async () => {
        let hasError = false;

        const newItems: formItems = { ...forms };
        newItems.displayName.isError = false;
        newItems.displayName.helperText = "";

        if (forms.displayName.value.length == 0) {
            forms.displayName.isError = true;
            forms.displayName.helperText = "Please input display name";
            hasError = true;
        }

        if (countryCode.displayName.value.length == 0) {
            countryCode.displayName.isError = true;
            countryCode.displayName.helperText = "Please input code";
            hasError = true;
        }

        if (phoneNumber.displayName.value.length == 0) {
            phoneNumber.displayName.isError = true;
            phoneNumber.displayName.helperText = "Please input phone number";
            hasError = true;
        }

        if (validateEmail(email.displayName.value.length)) {
            email.displayName.isError = true;
            email.displayName.helperText = "Please input display name";
            hasError = true;
        }

        if (avatarUrl.displayName.value.length == 0) {
            avatarUrl.displayName.isError = true;
            avatarUrl.displayName.helperText = "Please input display name";
            hasError = true;
        }

        if (!hasError) {
            try {
                const result = await post("/api/management/user", {
                    displayName: forms.displayName.value,
                    emailAddress: email.displayName.value,
                    countryCode: countryCode.displayName.value,
                    telephoneNumber: phoneNumber.displayName.value,
                    avatarUrl: avatarUrl.displayName.value,
                    verified: verified,
                });

                showSnackBar({ severity: "success", text: "User added" });
                history.push("/user");
                newItems.displayName.value = "";
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Failed to add user, please check console.",
                });
            }
        }

        setForms(newItems);
    };

    return (
        <Layout subtitle="Add new user" showBack={true}>
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
                                error={countryCode.displayName.isError}
                                label="Country code"
                                value={countryCode.displayName.value}
                                onChange={(e) => {
                                    countryCode.displayName.value = e.target.value;
                                    setCountryCode({ ...countryCode });
                                }}
                                helperText={countryCode.displayName.helperText}
                            />
                            <TextField
                                required
                                fullWidth
                                error={phoneNumber.displayName.isError}
                                label="Phone number"
                                value={phoneNumber.displayName.value}
                                onChange={(e) => {
                                    phoneNumber.displayName.value = e.target.value;
                                    setPhoneNumber({ ...phoneNumber });
                                }}
                                helperText={phoneNumber.displayName.helperText}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={email.displayName.isError}
                            label="E-mail"
                            value={email.displayName.value}
                            onChange={(e) => {
                                email.displayName.value = e.target.value;
                                setEmail({ ...email });
                            }}
                            helperText={email.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={avatarUrl.displayName.isError}
                            label="Avatar URL"
                            value={avatarUrl.displayName.value}
                            onChange={(e) => {
                                avatarUrl.displayName.value = e.target.value;
                                setAvatarUrl({ ...avatarUrl });
                            }}
                            helperText={avatarUrl.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <FormControl component="fieldset">
                            <FormGroup aria-label="position" row>
                                <FormControlLabel
                                    value="start"
                                    control={<Checkbox onChange={handleChange} />}
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
                                validateAndAdd();
                            }}
                        >
                            Add new user
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Layout>
    );
}
