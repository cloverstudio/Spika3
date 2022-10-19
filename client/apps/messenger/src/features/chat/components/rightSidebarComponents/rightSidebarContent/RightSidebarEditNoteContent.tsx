import { Alert, AlertTitle, Box, Button, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import isValidURL from "../../../../../utils/isValidURL";

import {
    useCreateWebhookMutation,
    useEditWebhookMutation,
    useGetWebhookByRoomIdQuery,
} from "../../../api/webhook";
import { selectActiveRoomId } from "../../../slice/chatSlice";

export default function RightSidebarEditNoteContent(): React.ReactElement {
    const roomId = useSelector(selectActiveRoomId);
    const [url, setUrl] = useState("");
    const [verifySignature, setVerifySignature] = useState("");
    const [error, setError] = useState("");
    const [editWebhook] = useEditWebhookMutation();
    const [createWebhook] = useCreateWebhookMutation();
    const { data: webhookData } = useGetWebhookByRoomIdQuery(roomId);

    useEffect(() => {
        console.log({ webhookData });
        if (webhookData) {
            setUrl(webhookData.url);
            setVerifySignature(webhookData.verifySignature);
        }
    }, [webhookData]);

    const handleSubmit = async () => {
        if (!isValidURL(url)) {
            setError("Not valid URL");
            return;
        }

        if (!webhookData) {
            await createWebhook({ url, roomId }).unwrap();
        } else {
            await editWebhook({ id: webhookData.id, data: { roomId, url } }).unwrap();
        }
    };

    const handleChange = (value) => {
        setUrl(value);
        setError("");
    };

    return (
        <Box m={2}>
            <Typography mb={2} variant="h6">
                Webhook
            </Typography>

            <TextField
                sx={{ mb: 1 }}
                required
                fullWidth
                size="small"
                placeholder="Url"
                id="url"
                name="url"
                autoFocus
                value={url}
                error={!!error}
                onChange={({ target }) => handleChange(target.value)}
            />

            {verifySignature && <Typography mb={2}>Verify signature: {verifySignature}</Typography>}

            <Button onClick={handleSubmit} disabled={!url} fullWidth variant="contained">
                Save
            </Button>

            {error && (
                <Alert sx={{ mt: 2 }} severity="error">
                    <AlertTitle sx={{ mb: 0 }}>{error}</AlertTitle>
                </Alert>
            )}
        </Box>
    );
}
