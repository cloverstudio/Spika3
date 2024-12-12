import { Close } from "@mui/icons-material";
import {
    Box,
    Collapse,
    Dialog,
    Divider,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReleaseNotesDialog({ isOpen, onClose }: Props) {
    const { t } = useTranslation();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="lg"
            scroll="body"
            sx={{
                "& .MuiDialog-paper": {
                    ...(isMobile && {
                        width: "100%",
                    }),
                },
            }}
        >
            <Box
                sx={{
                    bgcolor: "background.paper",
                    textAlign: "center",
                }}
            >
                <IconButton
                    size="large"
                    sx={{
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        position: "absolute",
                        right: 32,
                        top: 32,
                        p: 0,
                    }}
                    onClick={onClose}
                >
                    <Close
                        sx={{
                            color: "text.primary",
                        }}
                    />
                </IconButton>
                <Typography color="text.primary" fontWeight={600} pt="34px">
                    {t("releaseNotes")}
                </Typography>
                <Typography color="text.primary" fontWeight={600} mt="34px" fontSize="14px">
                    {t("changeList")}
                </Typography>

                <Box
                    sx={{
                        px: isMobile ? 1 : 4,
                        pb: "25px",
                        width: isMobile ? "100%" : "610px",
                    }}
                >
                    <Divider
                        sx={{
                            mt: 2,
                            mb: 2,
                        }}
                    />
                    <Box
                        sx={{
                            overflowY: "auto",
                            maxHeight: "500px",
                            px: isMobile ? 0 : "30px",
                        }}
                    >
                        {versionList.map((item, index) => (
                            <VersionItem
                                key={item.version}
                                version={item.version}
                                changes={item.changes}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}

interface VersionItemProps {
    version: string;
    changes: JSX.Element;
}

function VersionItem({ version, changes }: VersionItemProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Box
            sx={{
                width: "100%",
                mb: "13px",
                cursor: "pointer",
            }}
            onClick={() => setIsOpen(!isOpen)}
        >
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    p: "10px",
                    borderRadius: "10px",
                }}
            >
                <Typography color="text.primary" fontWeight={500} fontSize="14px">
                    {t("version")} {version}
                </Typography>
                {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Box>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box
                    sx={{
                        mt: "10px",
                        pl: "25px",
                    }}
                >
                    {changes}
                </Box>
            </Collapse>
        </Box>
    );
}

const version1_3_0Html = (
    <Box
        textAlign="left"
        sx={{
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "20px",
        }}
    >
        <Typography
            sx={{
                fontWeight: 600,
            }}
        >
            DATE: 27/11/2024
        </Typography>
        <Typography
            sx={{
                fontWeight: 600,
            }}
        >
            'Klimpf Eastwood' patch notes:
        </Typography>
        <Typography
            sx={{
                fontWeight: 600,
                fontStyle: "italic",
            }}
            mt={2}
        >
            Version 1.3.0
        </Typography>
        <Typography
            sx={{
                fontWeight: 600,
            }}
        >
            New features:
        </Typography>
        <Typography
            sx={{
                fontWeight: 600,
            }}
        >
            Landing page:
        </Typography>
        <Typography>
            Now it is possible to switch between languages available on Spika via landing page
        </Typography>
        <Divider
            sx={{
                mt: 1,
                mb: 1,
            }}
        />
        <Typography
            sx={{
                fontWeight: 600,
            }}
        >
            Advanced user search:
        </Typography>
        <Typography>
            A new feature has been added to enhance user search functionality. Users can now apply
            filters to find other users based on:
        </Typography>
        <ul>
            <li>name/nickname</li>
            <li>country</li>
            <li>gender</li>
        </ul>

        <Divider
            sx={{
                mt: 1,
                mb: 1,
            }}
        />

        <Typography
            sx={{
                fontWeight: 600,
            }}
        >
            Enhanced settings menu:
        </Typography>
        <Typography>Two NEW options have been added for an improved user experience:</Typography>

        <Box pl={2} mt={1}>
            <Typography
                sx={{
                    fontWeight: 600,
                }}
            >
                Edit personal data:
            </Typography>
            <ul>
                <li>
                    users can now modify their first and last name (or nickname) indicate their
                    gender
                </li>
                <li>update their email address</li>
                <li>select their country of residence</li>
                <li>
                    upload or update their profile picture, all with an updated and user-friendly
                    interface
                </li>
            </ul>
            <Typography
                sx={{
                    fontWeight: 600,
                }}
            >
                Languages:
            </Typography>
            <ul>
                <li>switch between English and Croatian for a personalized language experience </li>
            </ul>
        </Box>

        <Divider
            sx={{
                mt: 1,
                mb: 1,
            }}
        />

        <Typography
            sx={{
                fontWeight: 600,
            }}
        >
            Improvements
        </Typography>
        <ul>
            <li>Cookies</li>
            <li>ReCAPTCHA implementation on landing page</li>
            <li>New and advanced logger</li>
            <li>
                Documentation update:
                <ul>
                    <li>internal documentation has been revised</li>
                    <li>
                        comprehensive change logs will now accompany every patch for improved
                        transparency and tracking
                    </li>
                    <li>fixed minor technical issues</li>
                </ul>
            </li>
        </ul>
    </Box>
);

const versionList = [
    {
        version: "1.3.0",
        changes: version1_3_0Html,
    },
];
