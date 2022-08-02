import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Stack,
    Select,
    Button,
    Typography,
    Box,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";
import { useCreateRoomMutation, useUpdateRoomMutation } from "../../api/room";
import uploadImage from "../../assets/upload-image.svg";
import uploadFile from "../../utils/uploadFile";
import { hide } from "../../store/rightDrawerSlice";
import { useDispatch } from "react-redux";

const roomModelSchema = yup.object({
    name: yup.string().required("Name is required"),
    type: yup.string().required("Type is required"),
    avatarUrl: yup.string().url(),
    deleted: yup.boolean(),
});

export default function RoomAdd() {
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();
    const [addRoom, addRoomMutation] = useCreateRoomMutation();
    const [file, setFile] = useState<File>();
    const uploadFileRef = React.useRef(null);
    const dispatch = useDispatch();
    const [update, updateMutation] = useUpdateRoomMutation();

    const [value, setValue] = React.useState("private");

    const formik = useFormik({
        initialValues: {
            name: "",
            type: value,
            avatarUrl: "",
            deleted: false,
        },
        validationSchema: roomModelSchema,
        onSubmit: (values) => {
            validateAndAdd();
        },
    });
    const handleChange = (event: SelectChangeEvent) => {
        setValue(event.target.value);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setFile(uploadedFile);
    };

    const validateAndAdd = async () => {
        try {
            await addRoom({
                name: formik.values.name,
                type: value,
                avatarUrl: formik.values.avatarUrl,
                deleted: formik.values.deleted,
            });

            showSnackBar({ severity: "success", text: "Room added" });
            navigate("/room");
        } catch (e: any) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: String(e.message),
            });
        }
    };

    useEffect(() => {
        (async () => {
            if (addRoomMutation.data && file) {
                addAvatar();
            }
        })();
    }, [addRoomMutation.data]);

    const addAvatar = async () => {
        try {
            const uploadedFile = await uploadFile({
                file,
                type: "avatar",
                relationId: addRoomMutation.data?.room.id,
            });
            await update({
                roomId: String(addRoomMutation.data?.room.id),
                data: {
                    name: formik.values.name,
                    type: formik.values.type,
                    avatarUrl: uploadedFile.path || "",
                    deleted: formik.values.deleted,
                },
            });
        } catch (error) {
            console.error("Update failed ", error);
        }
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2} padding={2}>
                <Typography component="h1" variant="subtitle1" noWrap style={{ color: "grey" }}>
                    Add Room
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
                    id="name"
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    label="Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    helperText={formik.touched.name && formik.errors.name}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <Select
                    labelId="demo-select-small"
                    id="demo-select-small"
                    value={value}
                    label="Type"
                    onChange={handleChange}
                >
                    <MenuItem sx={{ height: "50px" }} value={"private"} key={0}>
                        Private
                    </MenuItem>
                    <MenuItem sx={{ height: "50px" }} value={"group"} key={1}>
                        Group
                    </MenuItem>
                </Select>
                <Stack spacing={2} direction="row">
                    <Button variant="contained" type="submit" color="spikaButton">
                        Add new room
                    </Button>
                    <Button variant="outlined" color="spikaGrey" onClick={() => dispatch(hide())}>
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}
