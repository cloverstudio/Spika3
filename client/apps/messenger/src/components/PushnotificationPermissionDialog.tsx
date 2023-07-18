import React, { useState, useEffect, useCallback } from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import setupPushNotification from "./firebaseInit";

import * as constants from "../../../../lib/constants";
import PushNotificationInstructionImage from "../assets/pushnotification-instruction.gif";

import { useUpdateDeviceMutation, useGetDeviceQuery } from "../api/device";
import useStrings from "../hooks/useStrings";

export default function PushNotifPermissionDialog(): React.ReactElement {
    const strings = useStrings();
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [updateDevice] = useUpdateDeviceMutation();
    const { data, isLoading } = useGetDeviceQuery();

    const initPushNotification = useCallback(async () => {
        localStorage.setItem(constants.LSKEY_DISABLEPUSHALER, "1");

        if (!window.Notification) return;

        const permission = await window.Notification.requestPermission();

        if (permission === "granted") {
            const pushToken = await setupPushNotification();

            if (pushToken && pushToken.length > 0) {
                updateDevice({ pushToken });
            }
        }
    }, [updateDevice]);

    useEffect(() => {
        if (
            data &&
            data.device &&
            !data.device.pushToken &&
            window.Notification &&
            !localStorage.getItem(constants.LSKEY_DISABLEPUSHALER)
        ) {
            setShowPermissionDialog(true);
        }
    }, [updateDevice, data]);

    if (isLoading) {
        return null;
    }

    return (
        <Dialog
            open={showPermissionDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{strings.usePushNotificationService}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {strings.enablePushManually}
                </DialogContentText>
                <div
                    style={{
                        textAlign: "center",
                    }}
                >
                    <img src={PushNotificationInstructionImage} />
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        initPushNotification();
                        setShowPermissionDialog(false);
                    }}
                    id="enable-push-notification-button"
                >
                    {strings.enableDesktopNotifications}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
