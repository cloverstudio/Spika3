import React, { useState } from "react";
import { Button, TextField, FormLabel, Box, Alert, AlertTitle } from "@mui/material";

import uploadImage from "../../../assets/upload-image.svg";
import useStrings from "../../../hooks/useStrings";

type UpdateUserFormProps = {
    onSubmit: ({ username, file }: { username: string; file: File }) => void;
    error?: any;
};

export default function UpdateUserForm({
    onSubmit,
    error,
}: UpdateUserFormProps): React.ReactElement {
    const strings = useStrings();
    const [username, setUsername] = useState("");
    const [file, setFile] = useState<File>();
    const uploadFileRef = React.useRef(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setFile(uploadedFile);
    };

    const handleSubmit = async () => {
        onSubmit({ username, file });
    };

    return (
        <>
            <Box minWidth="320px" textAlign="center" mb={error ? 2 : 7}>
                <img
                    width="100px"
                    height="100px"
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
            {error && (
                <Alert sx={{ mb: 4 }} severity="error">
                    <AlertTitle sx={{ mb: 0 }}>{error.message}</AlertTitle>
                </Alert>
            )}
            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                <FormLabel sx={{ mb: 1.5, display: "block" }}>{strings.username}</FormLabel>
                <TextField
                    sx={{ mb: 3 }}
                    required
                    fullWidth
                    id="username"
                    placeholder={strings.enter}
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={({ target }) => setUsername(target.value)}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={username.length === 0}
                    fullWidth
                    variant="contained"
                >
                    {strings.next}
                </Button>
            </Box>
        </>
    );
}
