import React from "react";
import { Participant } from "./confcall";
import { Box, Typography, Stack, IconButton, Tooltip } from "@mui/material";
import { Videocam, VideocamOff, Mic, MicOff } from "@mui/icons-material";
import { padding } from "@mui/system";

const ConferenceCallItem = (props: any) => {
    let participant: Participant = props.participant;

    const handleCamera = () => {};
    const handleMic = () => {};

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "1em",
                position: "relative",
                "&:hover .overlay": {
                    display: "block",
                },
            }}
        >
            <Typography color="white">{participant.user.displayName}</Typography>
            <Box
                sx={{
                    bottom: 0,
                    left: 0,
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "none",
                }}
                className="overlay"
            >
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <Box
                        sx={{
                            bottom: 0,
                            position: "absolute",
                            width: "60%",
                            height: "10%",
                            backgroundColor: "white",
                            opacity: 0.3,
                            left: "50%",
                            transform: "translate(-50%, 0%)",
                        }}
                    ></Box>
                    <Box
                        sx={{
                            bottom: 0,
                            position: "absolute",
                            width: "60%",
                            height: "10%",
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                            left: "50%",
                            transform: "translate(-50%, 0%)",
                            zIndex: 10,
                        }}
                    >
                        <Typography color="white">{participant.user.displayName}</Typography>
                    </Box>
                    <Box
                        sx={{
                            bottom: 0,
                            position: "absolute",
                            width: "20%",
                            height: "10%",
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                            left: "73%",
                            transform: "translate(-50%, 0%)",
                            zIndex: 10,
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="right"
                            spacing={1}
                            sx={{ display: "flex", flexDirection: "row", justifyContent: "right" }}
                        >
                            <Tooltip title="No Video">
                                <IconButton sx={{ padding: 0 }} onClick={handleCamera}>
                                    <Videocam style={{ fill: "white" }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Mute">
                                <IconButton sx={{ padding: 0 }} onClick={handleMic}>
                                    <Mic style={{ fill: "white" }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ConferenceCallItem;
