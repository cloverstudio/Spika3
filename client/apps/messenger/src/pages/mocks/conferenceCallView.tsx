import React, { useEffect } from "react";
import {
    Fab,
    Drawer,
    Box,
    Stack,
    IconButton,
    Grid,
    GridSize,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Button,
} from "@mui/material";
import {
    Menu,
    Videocam,
    VideocamOff,
    Mic,
    MicOff,
    Groups,
    Monitor,
    Close,
    KeyboardArrowUp,
} from "@mui/icons-material";
import { Participant } from "../mocks/confcall";
import * as defaults from "../mocks/confcall";
import ConferenceCallItem from "../mocks/conferenceCallItem";
import MediaOutputModalView from "./conferenceCallModalView";

function ConferenceCallView() {
    const dataArray: Participant[] = defaults.participants;
    const myData: Participant = defaults.me;
    const [open, setOpen] = React.useState(false);
    const [participantCount, setParticipantCount] = React.useState<number>(0);
    const [gridSize, setGridSize] = React.useState<GridSize>(6);
    const [combinedArray, setCombinedArray] = React.useState<Participant[]>(dataArray);
    const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>(null);
    const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>(null);
    const [selectedVideoDevice, setSelectedVideoDevice] = React.useState<MediaDeviceInfo>(null);
    const [selectedAudioDevice, setSelectedAudioDevice] = React.useState<MediaDeviceInfo>(null);
    const [openModal, setOpenModal] = React.useState<boolean>(false);
    const [isItAudio, setIsItAudio] = React.useState<boolean>(false);
    const [mute, setMute] = React.useState<boolean>(false);
    const [cameraOff, setCameraOff] = React.useState<boolean>(false);
    const [screenShare, setScreenShare] = React.useState<boolean>(false);
    const handleCamera = () => {
        setCameraOff(!cameraOff);
    };
    const chooseVideoOutput = async () => {
        setIsItAudio(false);
        setOpenModal(true);
    };
    const handleMic = () => {
        setMute(!mute);
    };
    const chooseAudioOutput = async () => {
        console.log("dal udje");
        setIsItAudio(true);
        setOpenModal(true);
    };
    const handleGroup = () => {};
    const handleShare = () => {
        setScreenShare(!screenShare);
    };

    const closeConference = () => {};

    const handleDrawerOpen = () => {
        console.log("click");
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const calculateLayoutByParticipantNumber = () => {
        let numberOfParticipants: number = dataArray.length + 1;
        var indexForOwnData = 0;
        if (numberOfParticipants > 2 && numberOfParticipants < 5) {
            if (!screenShare) {
                setGridSize(6);
                indexForOwnData = 2;
            }
        }
        if (numberOfParticipants > 4 && numberOfParticipants < 7) {
            if (!screenShare) {
                setGridSize(4);
                indexForOwnData = 3;
            }
        }
        if (numberOfParticipants > 6) {
            if (!screenShare) {
                setGridSize(3);
                let numberOfRows = Math.floor(dataArray.length / 4);
                console.log(numberOfParticipants);
                indexForOwnData = numberOfRows * 4;
            }
        }
        if (screenShare) {
            setGridSize(12);
            indexForOwnData = dataArray.length;
        }
        const newData = dataArray.slice(0); // copy
        newData.splice(indexForOwnData, 0, myData);
        console.log(indexForOwnData);
        setCombinedArray(newData);
        setParticipantCount(newData.length);
    };

    useEffect(() => {
        calculateLayoutByParticipantNumber();
    }, [screenShare]);

    return (
        <Box sx={{ display: "flex", backgroundColor: "lightgray" }} position="relative">
            {/* <Fab
                sx={{ position: "absolute", right: 20, top: 20 }}
                color="default"
                onClick={handleDrawerOpen}
            >
                <Menu />
            </Fab>
            <Drawer
                open={open}
                onClose={handleDrawerClose}
                sx={{
                    width: { xs: "50%", sm: "25%", md: "25%", lg: "25%", xl: "25%" },
                    flexShrink: { sm: 0 },
                    "& .MuiDrawer-paper": {
                        width: { xs: "50%", sm: "25%", md: "25%", lg: "25%", xl: "25%" },
                    },
                }}
                anchor="right"
            >
                Test
            </Drawer> */}
            {screenShare ? (
                <Stack
                    direction="row"
                    alignItems="right"
                    spacing={1}
                    sx={{ display: "flex", flexDirection: "row", justifyContent: "right" }}
                >
                    <Box width="80vw" height="91vh" my={1} display="flex" justifyContent="center">
                        Screen share
                    </Box>
                    <Box width="20vw" height="91vh" my={1} display="flex" justifyContent="center">
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
                            {combinedArray.map((row) => (
                                <Grid item xs={gridSize} lg={gridSize} xl={gridSize}>
                                    <ConferenceCallItem participant={row} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Stack>
            ) : (
                [
                    combinedArray.length < 3 ? (
                        <Box width="100%" height="91vh" position="relative">
                            <Box width="100%" height="100%">
                                <ConferenceCallItem participant={dataArray[0]} />
                            </Box>
                            <Box width="30%" height="30%" position="absolute" bottom="0" left="0">
                                <ConferenceCallItem participant={myData} />
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            width="100%"
                            height="91vh"
                            my={1}
                            display="flex"
                            justifyContent="center"
                        >
                            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
                                {combinedArray.map((row) => (
                                    <Grid item xs={gridSize} lg={gridSize} xl={gridSize}>
                                        <ConferenceCallItem participant={row} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ),
                ]
            )}
            <Box
                position="fixed"
                bottom="0"
                left="0"
                height="8vh"
                width="100%"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",

                    background: "linear-gradient(rgba(255,255,255,.2) 40%, rgba(150,150,150,.8))",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}
                >
                    <Box>
                        <IconButton sx={{ padding: 0 }} onClick={handleCamera}>
                            {cameraOff ? (
                                <VideocamOff style={{ fill: "white" }} />
                            ) : (
                                <Videocam style={{ fill: "white" }} />
                            )}
                        </IconButton>
                        <IconButton sx={{ padding: 0 }} onClick={chooseVideoOutput}>
                            <KeyboardArrowUp fontSize="small" style={{ fill: "white" }} />
                        </IconButton>
                    </Box>
                    <Box>
                        <IconButton sx={{ padding: 0 }} onClick={handleMic}>
                            {mute ? (
                                <MicOff style={{ fill: "white" }} />
                            ) : (
                                <Mic style={{ fill: "white" }} />
                            )}
                        </IconButton>
                        <IconButton sx={{ padding: 0 }} onClick={chooseAudioOutput}>
                            <KeyboardArrowUp fontSize="small" style={{ fill: "white" }} />
                        </IconButton>
                    </Box>
                    <IconButton onClick={handleGroup}>
                        <Groups style={{ fill: "white" }} />
                    </IconButton>
                    <IconButton onClick={handleShare}>
                        <Monitor style={{ fill: "white" }} />
                    </IconButton>
                    <IconButton onClick={closeConference}>
                        <Close style={{ fill: "red" }} />
                    </IconButton>
                </Stack>
            </Box>
            {openModal ? (
                <MediaOutputModalView
                    isItAudio={isItAudio}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    selectedAudioOutput={setSelectedAudioDevice}
                    selectedVideoOutput={setSelectedVideoDevice}
                />
            ) : (
                <Box></Box>
            )}
        </Box>
    );
}

export default ConferenceCallView;
