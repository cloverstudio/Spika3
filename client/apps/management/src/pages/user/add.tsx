import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Typography,
    Button,
    Stack,
    Checkbox,
    FormGroup,
    FormControl,
    FormControlLabel,
    Box,
} from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";
import { useCreateUserMutation, useUpdateUserMutation } from "../../api/user";
import { hide } from "../../store/rightDrawerSlice";
import { useDispatch } from "react-redux";
import uploadImage from "../../assets/upload-image.svg";
import uploadFile from "../../utils/uploadFile";

const userModelSchema = yup.object({
    displayName: yup.string().required("Display name is required"),
    telephoneNumber: yup
        .number()
        .required("Telephone number is required")
        .typeError("Numbers only!"),
    email: yup.string().email("Not valid email"),
    avatarUrl: yup.string(),
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

    const [file, setFile] = useState<File>();
    const uploadFileRef = React.useRef(null);
    const [update, updateMutation] = useUpdateUserMutation();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setFile(uploadedFile);
    };

    useEffect(() => {
        (async () => {
            if (addUserMutation.data && file) {
                addAvatar();
            }
        })();
    }, [addUserMutation.data]);

    const addAvatar = async () => {
        try {
            const uploadedFile = await uploadFile({
                file,
                type: "avatar",
                relationId: addUserMutation.data?.user.id,
            });
            await update({
                userId: String(addUserMutation.data?.user.id),
                data: {
                    displayName: formik.values.displayName,
                    emailAddress: formik.values.email,
                    telephoneNumber: formik.values.telephoneNumber,
                    avatarUrl: uploadedFile.path || "",
                    verified: formik.values.verified,
                },
            });
        } catch (error) {
            console.error("Update failed ", error);
        }
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
            <Stack spacing={2} padding={2}>
                <Typography component="h1" variant="subtitle1" noWrap style={{ color: "grey" }}>
                    Add User
                </Typography>
                <Box textAlign="center" mt={3} mb={5}>
                    <img
                        width={100}
                        height={100}
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                        src={file ? URL.createObjectURL(file) : uploadImage}
                        onClick={() => uploadFileRef.current?.click()}
                    />
                    <input
                        onChange={handleFileUpload}
                        type="file"
                        style={{ display: "none" }}
                        ref={uploadFileRef}
                        accept="image/*"
                    />
                </Box>
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
                {/* <TextField
                    fullWidth
                    id="avatarUrl"
                    error={formik.touched.avatarUrl && Boolean(formik.errors.avatarUrl)}
                    label="Avatar Url"
                    value={formik.values.avatarUrl}
                    onChange={formik.handleChange}
                    helperText={formik.touched.avatarUrl && formik.errors.avatarUrl}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                /> */}
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
        </form>
    );
}
