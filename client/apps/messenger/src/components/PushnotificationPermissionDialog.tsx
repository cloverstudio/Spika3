import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";

import setupPushnotification from "./firebaseInit";
import { Stack } from "@mui/material";

import logo from "../assets/logo.svg";

import * as constants from "../../../../lib/constants";
import PushnotificationInstructionImage from "../assets/pushnotification-instruction.gif";

import { useGetDeviceQuery, useUpdateDeviceMutation } from "../api/device";

export default (): React.ReactElement => {
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

        initPushnotification();
    }, []);

    const initPushnotification = async () => {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Notification permission granted.");
            const pushToken = await setupPushnotification();
            console.log("Retrivbed push token", pushToken);
            if (pushToken && pushToken.length > 0) updateDevice({ pushToken });
        } else {
        }
    };

    return (
        <Dialog
            open={showPermissionDialog}
            onClose={() => {}}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Use push notification service ?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Please enable push notification manually in your browser to use this feature.
                </DialogContentText>
                <div
                    style={{
                        textAlign: "center",
                    }}
                >
                    <img src={PushnotificationInstructionImage} />
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        localStorage.setItem(constants.LSKEY_DISABLEPUSHALER, "1");
                        setShowPermissionDialog(false);
                    }}
                >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};
