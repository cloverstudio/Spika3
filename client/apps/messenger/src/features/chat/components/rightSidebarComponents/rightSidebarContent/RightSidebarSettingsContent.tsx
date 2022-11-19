import { Alert, AlertTitle, Box, Button, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import isValidURL from "../../../../../utils/isValidURL";
import {
    useCreateApiKeyMutation,
    useDeleteApiKeyMutation,
    useEditApiKeyMutation,
    useGetApiKeyByRoomIdQuery,
} from "../../../api/apiKey";

import {
    useCreateWebhookMutation,
    useDeleteWebhookMutation,
    useEditWebhookMutation,
    useGetWebhookByRoomIdQuery,
} from "../../../api/webhook";
import { selectActiveRoomId } from "../../../slice/chatSlice";

export default function RightSidebarEditNoteContent({
    showApiKeySettings,
}: {
    showApiKeySettings?: boolean;
}): React.ReactElement {
    return (
        <Box>
            <WebhookSettings />
            {showApiKeySettings && <ApiKeySettings />}
        </Box>
    );
}

function WebhookSettings(): React.ReactElement {
    const roomId = useSelector(selectActiveRoomId);
    const [url, setUrl] = useState("");
    const [verifySignature, setVerifySignature] = useState("");
    const [error, setError] = useState("");
    const [editWebhook] = useEditWebhookMutation();
    const [createWebhook] = useCreateWebhookMutation();
    const [removeWebhook] = useDeleteWebhookMutation();
    const { data: webhookData } = useGetWebhookByRoomIdQuery(roomId);

    useEffect(() => {
        setUrl(webhookData?.url || "");
        setVerifySignature(webhookData?.verifySignature || "");
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

    const handleRemove = async () => {
        if (webhookData?.id) {
            removeWebhook(webhookData.id);
        }
    };

    const handleChange = (value) => {
        setUrl(value);
        setError("");
    };

    return (
        <Box p={2} mb={4}>
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

            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end"
            }}> 
                <Button onClick={handleSubmit} sx={{ mr: 1 }} disabled={!url} variant="contained">
                    {webhookData?.id ? "Save" : "Create"}
                </Button>


                {webhookData?.id && (
                    <Button
                        onClick={handleRemove}
                        variant="outlined"
                        color="error"
                    >
                        Remove
                    </Button>
                )}


            </Box>

            {error && (
                <Alert sx={{ mt: 2 }} severity="error">
                    <AlertTitle sx={{ mb: 0 }}>{error}</AlertTitle>
                </Alert>
            )}
        </Box>
    );
}

function ApiKeySettings(): React.ReactElement {
    const roomId = useSelector(selectActiveRoomId);
    const [displayName, setDisplayName] = useState("");
    const [key, setKey] = useState("");
    const [error, setError] = useState("");
    const [editApiKey] = useEditApiKeyMutation();
    const [createApiKey] = useCreateApiKeyMutation();
    const [removeApiKey] = useDeleteApiKeyMutation();
    const { data: apiKeyData } = useGetApiKeyByRoomIdQuery(roomId);

    useEffect(() => {
        setDisplayName(apiKeyData?.displayName || "");
        setKey(apiKeyData?.token || "");
    }, [apiKeyData]);

    const handleSubmit = async () => {
        if (!apiKeyData) {
            await createApiKey({ displayName, roomId }).unwrap();
        } else {
            await editApiKey({ id: apiKeyData.id, data: { roomId, displayName } }).unwrap();
        }
    };

    const handleRemove = async () => {
        if (apiKeyData?.id) {
            removeApiKey(apiKeyData.id);
        }
    };

    const handleChange = (value) => {
        setDisplayName(value);
        setError("");
    };

    return (
        <Box m={2}>
            <Typography mb={2} variant="h6">
                API key
            </Typography>

            <TextField
                sx={{ mb: 1 }}
                required
                fullWidth
                size="small"
                placeholder="Display name"
                id="displayName"
                name="displayName"
                autoFocus
                value={displayName}
                error={!!error}
                onChange={({ target }) => handleChange(target.value)}
            />

            {key && <Typography mb={2}>Api key: {key}</Typography>}
            {key && <Typography mb={2}>POST url: {API_BASE_URL}/messaging/messages</Typography>}

            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end"
            }}> 
                <Button onClick={handleSubmit} sx={{ mr: 1 }} disabled={!displayName} variant="contained">
                    {apiKeyData?.id ? "Save" : "Create"}
                </Button>

                {apiKeyData?.id && (
                    <Button
                        onClick={handleRemove}
                        variant="outlined"
                        color="error"
                    >
                        Remove
                    </Button>
                )}


            </Box>
            

            {error && (
                <Alert sx={{ mt: 2 }} severity="error">
                    <AlertTitle sx={{ mb: 0 }}>{error}</AlertTitle>
                </Alert>
            )}
        </Box>
    );
}
