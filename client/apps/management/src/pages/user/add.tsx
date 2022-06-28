import React from "react";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Paper,
    Typography,
    Button,
    Stack,
    Checkbox,
    FormGroup,
    FormControl,
    FormControlLabel,
} from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";
import { useCreateUserMutation } from "../../api/user";
import { hide } from "../../store/rightDrawerSlice";
import { useDispatch } from "react-redux";

const userModelSchema = yup.object({
    displayName: yup.string().required("Display name is required"),
    telephoneNumber: yup
        .number()
        .required("Telephone number is required")
        .typeError("Numbers only!"),
    email: yup.string().required("Email is required").email("Not valid email"),
    avatarUrl: yup.string().url(),
    verified: yup.boolean(),
});

export default function Dashboard() {
    const showSnackBar = useShowSnackBar();
    const [addUser, addUserMutation] = useCreateUserMutation();
    const dispatch = useDispatch();
    const formik = useFormik({
        initialValues: {
            displayName: "",
            telephoneNumber: "",
            email: "",
            avatarUrl: "",
            verified: false,
        },
        validationSchema: userModelSchema,
        onSubmit: (values) => {
            validateAndAdd();
        },
    });

    const [verified, setVerified] = React.useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVerified(event.target.checked);
    };

    const validateAndAdd = async () => {
        try {
            await addUser({
                displayName: formik.values.displayName,
                emailAddress: formik.values.email,
                telephoneNumber: formik.values.telephoneNumber,
                avatarUrl: formik.values.avatarUrl,
                verified: formik.values.verified,
            });

            showSnackBar({ severity: "success", text: "User added" });
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
            {/* <Paper
                sx={{
                    margin: "24px",
                    p: "24px",
                    height: "100%",
                }}
            > */}
            <Stack spacing={2} padding={2}>
                <Typography component="h1" variant="subtitle1" noWrap style={{ color: "grey" }}>
                    Add User
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

                <TextField
                    required
                    fullWidth
                    id="telephoneNumber"
                    error={formik.touched.telephoneNumber && Boolean(formik.errors.telephoneNumber)}
                    label="Phone number"
                    value={formik.values.telephoneNumber}
                    onChange={formik.handleChange}
                    helperText={formik.touched.telephoneNumber && formik.errors.telephoneNumber}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
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
                        Add new user
                    </Button>
                    <Button variant="outlined" color="spikaGrey" onClick={() => dispatch(hide())}>
                        Cancel
                    </Button>
                </Stack>
            </Stack>
            {/* </Paper> */}
        </form>
    );
}
