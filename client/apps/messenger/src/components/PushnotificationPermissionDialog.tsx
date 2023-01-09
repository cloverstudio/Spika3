import React, { useState, useEffect } from "react";

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

    useEffect(() => {
        if (!window.Notification) return;

        if (
            !localStorage.getItem(constants.LSKEY_DISABLEPUSHALER) &&
            Notification.permission !== "granted"
        ) {
            // show permission dialog
            return setShowPermissionDialog(true);
        }

        const initPushNotification = async () => {
            if (!window.Notification) return;

            const permission = await Notification.requestPermission();

            if (permission === "granted") {
                const pushToken = await setupPushNotification();
                if (pushToken && pushToken.length > 0) updateDevice({ pushToken });
            }
        };

        initPushNotification();
    }, [updateDevice]);

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
                        localStorage.setItem(constants.LSKEY_DISABLEPUSHALER, "1");
                        setShowPermissionDialog(false);
                    }}
                >
                    {strings.ok}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
