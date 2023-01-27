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

import { useUpdateDeviceMutation } from "../api/device";
import useStrings from "../hooks/useStrings";

export default function PushNotifPermissionDialog(): React.ReactElement {
    const strings = useStrings();
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [updateDevice] = useUpdateDeviceMutation();

    const initPushNotification = useCallback(async () => {
        if (!window.Notification) return;

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const pushToken = await setupPushNotification();

            if (pushToken && pushToken.length > 0) {
                updateDevice({ pushToken });
                localStorage.setItem(constants.LSKEY_DISABLEPUSHALER, "1");
            }
        }
    }, [updateDevice]);

    useEffect(() => {
        if (
            window.Notification &&
            !localStorage.getItem(constants.LSKEY_DISABLEPUSHALER) &&
            Notification.permission !== "granted"
        ) {
            setShowPermissionDialog(true);
        } else {
            initPushNotification();
        }
    }, [updateDevice, initPushNotification]);

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
                >
                    {strings.ok}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
