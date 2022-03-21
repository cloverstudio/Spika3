import React, { useState } from "react";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";

import { Base } from "../components/Base";
import LeftSidebar from "../features/chat/LeftSidebar";
import { Outlet } from "react-router-dom";

import { useShowSnackBar, useShowBasicDialog } from "../hooks/useModal";

import Confcall from "../components/confcall";

export default function Home(): React.ReactElement {
    const [showConfcall, setShowConfcall] = useState<boolean>(false);
    const showSnackbar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();

    return (
        <Base>
            <Box>
                <Button
                    variant="text"
                    onClick={(e) => {
                        showSnackbar({
                            severity: "info",
                            text: "Hello",
                        });
                    }}
                >
                    Show Info Snackbar
                </Button>
                <Button
                    variant="text"
                    onClick={(e) => {
                        showSnackbar({
                            severity: "warning",
                            text: "Hello",
                        });
                    }}
                >
                    Show Warning Snackbar
                </Button>
                <Button
                    variant="text"
                    onClick={(e) => {
                        showSnackbar({
                            severity: "error",
                            text: "Hello",
                        });
                    }}
                >
                    Show Error Snackbar
                </Button>
                <Button
                    variant="text"
                    onClick={(e) => {
                        showSnackbar({
                            severity: "success",
                            text: "Hello",
                        });
                    }}
                >
                    Show Success Snackbar
                </Button>
            </Box>
            <Box>
                <Button
                    variant="text"
                    onClick={(e) => {
                        showBasicDialog({
                            text: "Hello",
                        });
                    }}
                >
                    Show Simple Dialog
                </Button>
                <Button
                    variant="text"
                    onClick={(e) => {
                        showBasicDialog({
                            text: "Hello",
                            title: "Title",
                        });
                    }}
                >
                    Show Title
                </Button>
                <Button
                    variant="text"
                    onClick={() => {
                        showBasicDialog(
                            {
                                text: "Lister test",
                                title: "Title",
                                allowButtonLabel: "OK",
                                denyButtonLabel: "Cancel",
                            },
                            () => {
                                alert("OK selected");
                            },
                            () => {
                                alert("Cancel selected");
                            }
                        );
                    }}
                >
                    Dialog with listener
                </Button>
            </Box>
            <Box>
                <Button
                    variant="text"
                    onClick={(e) => {
                        setShowConfcall(true);
                    }}
                >
                    Show conference call
                </Button>
            </Box>

            {showConfcall ? (
                <Box
                    style={{
                        position: "absolute",
                        width: "100vw",
                        height: "100vh",
                        left: "0px",
                        top: "0px",
                    }}
                >
                    <Confcall
                        roomId="test"
                        userId="test"
                        userName="test"
                        onClose={() => {
                            setShowConfcall(false);
                        }}
                    />
                </Box>
            ) : null}
        </Base>
    );
}
