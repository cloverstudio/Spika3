import React, { useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
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

import { useShowSnackBar } from "../../components/useUI";
import { User } from "@prisma/client";
import * as yup from "yup";
import { useFormik } from "formik";
import e from "express";

const userModelSchema = yup.object({
    displayName: yup.string().required("Display name is required"),
    countryCode: yup.string().required("Code is required"),
    telephoneNumber: yup.string().required("Telephone number is required"),
    email: yup.string().required("Email is required").email("Not valid email"),
    avatarUrl: yup.string().url(),
    verificationCode: yup.string(),
    verified: yup.boolean(),
});

export default function Page() {
    const urlParams: { id: string } = useParams();
    const history = useHistory();
    const showSnackBar = useShowSnackBar();
    const get = useGet();
    const put = usePut();

    const formik = useFormik({
        initialValues: {
            displayName: "",
            countryCode: "",
            telephoneNumber: "",
            email: "",
            avatarUrl: "",
            verificationCode: "",
            verified: false,
        },
        validationSchema: userModelSchema,
        onSubmit: (values) => {
            console.log(serverUser);
            if (
                (serverUser.values.countryCode != formik.values.countryCode ||
                    serverUser.values.telephoneNumber != formik.values.telephoneNumber) &&
                serverUser.values.email != formik.values.email
            ) {
                checkAllParameters();
            } else if (
                serverUser.values.countryCode != formik.values.countryCode ||
                serverUser.values.telephoneNumber != formik.values.telephoneNumber
            ) {
                checkPhoneNumber();
            } else if (serverUser.values.email != formik.values.email) {
                checkEmail();
            } else {
                validateAndUpdate();
            }
        },
    });

    const serverUser = useFormik({
        initialValues: {
            displayName: "",
            countryCode: "",
            telephoneNumber: "",
            email: "",
            avatarUrl: "",
            verificationCode: "",
            verified: false,
        },
        validationSchema: userModelSchema,
        onSubmit: (values) => {},
    });

    useEffect(() => {
        (async () => {
            try {
                const response: User = await get(`/api/management/user/${urlParams.id}`);
                const checkName = response.displayName == null ? "" : response.displayName;
                const checkCC = response.countryCode == null ? "" : response.countryCode;
                const checkPhone = response.telephoneNumber == null ? "" : response.telephoneNumber;
                const checkEmail = response.emailAddress == null ? "" : response.emailAddress;
                const checkUrl = response.avatarUrl == null ? "" : response.avatarUrl;
                const checkVer = response.verified == null ? false : response.verified;
                const checkVerCode =
                    response.verificationCode == null ? "" : response.verificationCode;
                formik.setValues({
                    displayName: checkName,
                    countryCode: checkCC,
                    telephoneNumber: checkPhone,
                    email: checkEmail,
                    avatarUrl: checkUrl,
                    verificationCode: checkVerCode,
                    verified: checkVer,
                });
                serverUser.setValues({
                    displayName: checkName,
                    countryCode: checkCC,
                    telephoneNumber: checkPhone,
                    email: checkEmail,
                    avatarUrl: checkUrl,
                    verificationCode: checkVerCode,
                    verified: checkVer,
                });
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Server error, please check browser console.",
                });
            }
        })();
    }, []);

    const checkAllParameters = async () => {
        try {
            const response = await get(
                `/api/management/user/phoneNumber?countryCode=${formik.values.countryCode}&telephoneNumber=${formik.values.telephoneNumber}&email=${formik.values.email}`
            );
            if (!response.exists) {
                validateAndUpdate();
            } else {
                var errorText = "";
                if (response.phoneExist && response.emailExists) {
                    errorText = "User with that phone number and email already exists";
                } else if (response.phoneExist) {
                    errorText = "User with that country code and telephone number already exists";
                } else if (response.emailExists) {
                    errorText = "User with that email already exists";
                }
                showSnackBar({
                    severity: "error",
                    text: errorText,
                });
            }
        } catch (e) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: "Server error, please check browser console.",
            });
        }
    };

    const checkPhoneNumber = async () => {
        try {
            const response = await get(
                `/api/management/user/existingUserPhoneNumber?countryCode=${formik.values.countryCode}&telephoneNumber=${formik.values.telephoneNumber}`
            );
            if (!response.exists) {
                validateAndUpdate();
            } else {
                var errorText = "User with that country code and telephone number already exists";
                showSnackBar({
                    severity: "error",
                    text: errorText,
                });
            }
        } catch (e) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: "Server error, please check browser console.",
            });
        }
    };

    const checkEmail = async () => {
        try {
            const response = await get(
                `/api/management/user/existingUserEmail?email=${formik.values.email}`
            );
            if (!response.exists) {
                validateAndUpdate();
            } else {
                var errorText = "User with that email already exists";
                showSnackBar({
                    severity: "error",
                    text: errorText,
                });
            }
        } catch (e) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: "Server error, please check browser console.",
            });
        }
    };

    const validateAndUpdate = async () => {
        try {
            const result = await put(`/api/management/user/${urlParams.id}`, {
                displayName: formik.values.displayName,
                emailAddress: formik.values.email,
                countryCode: formik.values.countryCode,
                telephoneNumber: formik.values.telephoneNumber,
                avatarUrl: formik.values.avatarUrl,
                verified: formik.values.verified,
                verificationCode: formik.values.verificationCode,
            });

            showSnackBar({ severity: "success", text: "User updated" });
            history.push("/user");
        } catch (e) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: "Failed to update user, please check console.",
            });
        }
    };

    return (
        <Layout subtitle={`User detail ( ${urlParams.id} )`} showBack={true}>
            <form onSubmit={formik.handleSubmit}>
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
                                id="displayName"
                                error={
                                    formik.touched.displayName && Boolean(formik.errors.displayName)
                                }
                                label="Display Name"
                                value={formik.values.displayName}
                                onChange={formik.handleChange}
                                helperText={formik.touched.displayName && formik.errors.displayName}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Stack alignItems="center" spacing={1} direction="row">
                                <TextField
                                    required
                                    id="countryCode"
                                    error={
                                        formik.touched.countryCode &&
                                        Boolean(formik.errors.countryCode)
                                    }
                                    label="Country code"
                                    value={formik.values.countryCode}
                                    onChange={formik.handleChange}
                                    helperText={
                                        formik.touched.countryCode && formik.errors.countryCode
                                    }
                                />
                                <TextField
                                    required
                                    fullWidth
                                    id="telephoneNumber"
                                    error={
                                        formik.touched.telephoneNumber &&
                                        Boolean(formik.errors.telephoneNumber)
                                    }
                                    label="Phone number"
                                    value={formik.values.telephoneNumber}
                                    onChange={formik.handleChange}
                                    helperText={
                                        formik.touched.telephoneNumber &&
                                        formik.errors.telephoneNumber
                                    }
                                />
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                required
                                id="email"
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                label="E-mail"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                id="telephoneNumber"
                                error={formik.touched.avatarUrl && Boolean(formik.errors.avatarUrl)}
                                label="Avatar Url"
                                value={formik.values.avatarUrl}
                                onChange={formik.handleChange}
                                helperText={formik.touched.avatarUrl && formik.errors.avatarUrl}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                id="verificationCode"
                                error={
                                    formik.touched.verificationCode &&
                                    Boolean(formik.errors.verificationCode)
                                }
                                label="Verification Code"
                                value={formik.values.verificationCode}
                                onChange={formik.handleChange}
                                helperText={
                                    formik.touched.verificationCode &&
                                    formik.errors.verificationCode
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <FormControl component="fieldset">
                                <FormGroup aria-label="position" row>
                                    <FormControlLabel
                                        value="start"
                                        control={<Checkbox onChange={formik.handleChange} />}
                                        label="Verified"
                                        labelPlacement="start"
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={8} textAlign="right">
                            <Button variant="contained" type="submit">
                                Edit user
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Layout>
    );
}
