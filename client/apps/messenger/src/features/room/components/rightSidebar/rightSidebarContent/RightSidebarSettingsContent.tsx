import { Alert, AlertTitle, Box, Button, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useStrings from "../../../../../hooks/useStrings";
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
    const strings = useStrings();
    const roomId = parseInt(useParams().id || "");

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
            setError(strings.notValidUrl);
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
        <Box mb={4}>
            <Typography mb={2} variant="h6">
                {strings.webhook}
            </Typography>

            <TextField
                sx={{ mb: 1 }}
                required
                fullWidth
                size="small"
                placeholder={strings.url}
                id="url"
                name="url"
                autoFocus
                value={url}
                error={!!error}
                onChange={({ target }) => handleChange(target.value)}
            />

            {verifySignature && (
                <Typography mb={2}>
                    {strings.verifySignature}: {verifySignature}
                </Typography>
            )}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                }}
            >
                <Button onClick={handleSubmit} disabled={!url} sx={{ mr: 1 }} variant="contained">
                    {webhookData?.id ? strings.save : strings.create}
                </Button>
                {webhookData?.id && (
                    <Button onClick={handleRemove} variant="outlined" color="error">
                        {strings.remove}
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
    const strings = useStrings();

    const roomId = parseInt(useParams().id || "");
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
        <Box>
            <Typography mb={2} variant="h6">
                {strings.apiKey}
            </Typography>

            <TextField
                sx={{ mb: 1 }}
                required
                fullWidth
                size="small"
                placeholder={strings.displayName}
                id="displayName"
                name="displayName"
                autoFocus
                value={displayName}
                error={!!error}
                onChange={({ target }) => handleChange(target.value)}
            />

            {key && (
                <Typography mb={2}>
                    {strings.apiKey}: {key}
                </Typography>
            )}
            {key && (
                <Typography mb={2}>
                    {strings.postUrl}: {API_BASE_URL}/messaging/messages
                </Typography>
            )}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "end",
                }}
            >
                <Button
                    onClick={handleSubmit}
                    disabled={!displayName}
                    sx={{ mr: 1 }}
                    variant="contained"
                >
                    {apiKeyData?.id ? strings.save : strings.create}
                </Button>

                {apiKeyData?.id && (
                    <Button onClick={handleRemove} variant="outlined" color="error">
                        {strings.remove}
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
