import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";

import setupPushNotification from "./firebaseInit";

import * as constants from "../../../../lib/constants";
import PushNotificationInstructionImage from "../assets/pushnotification-instruction.gif";

import { useUpdateDeviceMutation } from "../api/device";
import useStrings from "../hooks/useStrings";

export default function PushNotificationPermissionDialog(): React.ReactElement {
    const strings = useStrings();
    const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false);
    const [updateDevice] = useUpdateDeviceMutation();

    useEffect(() => {
        if (
            !localStorage.getItem(constants.LSKEY_DISABLEPUSHALER) &&
            Notification.permission !== "granted"
        ) {
            // show permission dialog
            return setShowPermissionDialog(true);
        }

        const initPushNotification = async () => {
            const permission = await Notification.requestPermission();

            if (permission === "granted") {
                const pushToken = await setupPushNotification();
                if (pushToken && pushToken.length > 0) updateDevice({ pushToken });
            } else {
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
