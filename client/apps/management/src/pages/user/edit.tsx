import React, { useEffect } from "react";
import {
    TextField,
    Typography,
    Button,
    Stack,
    FormGroup,
    FormControl,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";
import { useGetUserByIdQuery, useUpdateUserMutation } from "../../api/user";
import UserType from "../../types/User";
import { hide } from "../../store/rightDrawerSlice";
import { useDispatch } from "react-redux";

const userModelSchema = yup.object({
    displayName: yup.string().required("Display name is required"),
    telephoneNumber: yup.string().required("Telephone number is required"),
    email: yup.string().required("Email is required").email("Not valid email"),
    avatarUrl: yup.string().url(),
    verificationCode: yup.string(),
    verified: yup.boolean(),
});

type EditUserProps = {
    userId: string;
};

export default function Page(props: EditUserProps) {
    const { userId } = props;
    const showSnackBar = useShowSnackBar();
    const { data, isLoading } = useGetUserByIdQuery(userId);
    const [updateUser, updateUserMutation] = useUpdateUserMutation();
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            displayName: "",
            telephoneNumber: "",
            email: "",
            avatarUrl: "",
            verificationCode: "",
            verified: false,
        },
        validationSchema: userModelSchema,
        onSubmit: (values) => {
            validateAndUpdate();
        },
    });

    const serverUser = useFormik({
        initialValues: {
            displayName: "",
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
            if (!isLoading) {
                const response: UserType = data.user;
                const checkName = response.displayName == null ? "" : response.displayName;
                const checkPhone = response.telephoneNumber == null ? "" : response.telephoneNumber;
                const checkEmail = response.emailAddress == null ? "" : response.emailAddress;
                const checkUrl = response.avatarUrl == null ? "" : response.avatarUrl;
                const checkVer = response.verified == null ? false : response.verified;
                const checkVerCode =
                    response.verificationCode == null ? "" : response.verificationCode;
                formik.setValues({
                    displayName: checkName,
                    telephoneNumber: checkPhone,
                    email: checkEmail,
                    avatarUrl: checkUrl,
                    verificationCode: checkVerCode,
                    verified: checkVer,
                });
                serverUser.setValues({
                    displayName: checkName,
                    telephoneNumber: checkPhone,
                    email: checkEmail,
                    avatarUrl: checkUrl,
                    verificationCode: checkVerCode,
                    verified: checkVer,
                });
            }
        })();
    }, [data]);

    const validateAndUpdate = async () => {
        try {
            await updateUser({
                userId: userId,
                data: {
                    displayName: formik.values.displayName,
                    emailAddress: formik.values.email,
                    telephoneNumber: formik.values.telephoneNumber,
                    avatarUrl: formik.values.avatarUrl,
                    verified: formik.values.verified,
                    verificationCode: formik.values.verificationCode,
                },
            });
            showSnackBar({ severity: "success", text: "User updated" });
            dispatch(hide());
        } catch (e: any) {
            showSnackBar({
                severity: "error",
                text: String(e.message),
            });
        }
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2} padding={2}>
                <Typography component="h1" variant="subtitle1" noWrap style={{ color: "grey" }}>
                    Edit User
                </Typography>
                <TextField
                    required
                    fullWidth
                    id="displayName"
                    error={formik.touched.displayName && Boolean(formik.errors.displayName)}
                    label="Display Name"
                    value={formik.values.displayName}
                    onChange={formik.handleChange}
                    helperText={formik.touched.displayName && formik.errors.displayName}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <Stack alignItems="center" spacing={1} direction="row">
                    <TextField
                        required
                        fullWidth
                        id="telephoneNumber"
                        error={
                            formik.touched.telephoneNumber && Boolean(formik.errors.telephoneNumber)
                        }
                        label="Phone number"
                        value={formik.values.telephoneNumber}
                        onChange={formik.handleChange}
                        helperText={formik.touched.telephoneNumber && formik.errors.telephoneNumber}
                        size="small"
                        inputProps={{ style: { fontSize: 15 } }}
                        InputLabelProps={{ style: { fontSize: 15 } }}
                    />
                </Stack>
                <TextField
                    fullWidth
                    required
                    id="email"
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    label="E-mail"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    helperText={formik.touched.email && formik.errors.email}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <TextField
                    fullWidth
                    id="telephoneNumber"
                    error={formik.touched.avatarUrl && Boolean(formik.errors.avatarUrl)}
                    label="Avatar Url"
                    value={formik.values.avatarUrl}
                    onChange={formik.handleChange}
                    helperText={formik.touched.avatarUrl && formik.errors.avatarUrl}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <TextField
                    fullWidth
                    id="verificationCode"
                    error={
                        formik.touched.verificationCode && Boolean(formik.errors.verificationCode)
                    }
                    label="Verification Code"
                    value={formik.values.verificationCode}
                    onChange={formik.handleChange}
                    helperText={formik.touched.verificationCode && formik.errors.verificationCode}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <FormControl component="fieldset">
                    <FormGroup aria-label="position" row>
                        <FormControlLabel
                            value="start"
                            control={
                                <Checkbox
                                    id="verified"
                                    color="spikaButton"
                                    onChange={formik.handleChange}
                                />
                            }
                            label={
                                <Typography style={{ color: "grey" }} variant="body2">
                                    Verified
                                </Typography>
                            }
                            labelPlacement="start"
                            sx={{ ml: "0" }}
                        />
                    </FormGroup>
                </FormControl>
                <Stack spacing={2} direction="row">
                    <Button variant="contained" type="submit" color="spikaButton">
                        Edit user
                    </Button>
                    <Button variant="outlined" color="spikaGrey" onClick={() => dispatch(hide())}>
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}
