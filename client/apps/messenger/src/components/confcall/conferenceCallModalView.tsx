import React, { useEffect } from "react";
import {
    Box,
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

type Props = {
    openModal: boolean;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    isItAudio: boolean;
    selectedVideoOutput: React.Dispatch<React.SetStateAction<MediaDeviceInfo>>;
    selectedAudioOutput: React.Dispatch<React.SetStateAction<MediaDeviceInfo>>;
};

const MediaOutputModalView = ({
    openModal,
    setOpenModal,
    isItAudio,
    selectedVideoOutput,
    selectedAudioOutput,
}: Props) => {
    const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>(null);
    const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>(null);
    const [selectedVideoDevice, setSelectedVideoDevice] = React.useState<MediaDeviceInfo>(null);
    const [selectedAudioDevice, setSelectedAudioDevice] = React.useState<MediaDeviceInfo>(null);
    const [open, setOpen] = React.useState<boolean>(openModal);

    const handleClose = () => {
        setOpen(false);
        setOpenModal(false);
    };

    const handleOutputChange = (event: { target: { value: string } }) => {
        if (isItAudio) {
            const filter: MediaDeviceInfo[] = audioDevices.filter((device) =>
                device.deviceId.includes(event.target.value)
            );
            console.log(filter);
            setSelectedAudioDevice(filter[0]);
        } else {
            const filter: MediaDeviceInfo[] = videoDevices.filter((device) =>
                device.deviceId.includes(event.target.value)
            );
            console.log(filter);
            setSelectedVideoDevice(filter[0]);
        }
    };

    useEffect(() => {
        (async () => {
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            const devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter((device) => device.kind === "audioinput");
            setAudioDevices(audioDevices);
            setSelectedAudioDevice(audioDevices[0]);
            const videoDevices = devices.filter((device) => device.kind === "videoinput");
            setVideoDevices(videoDevices);
            console.log(videoDevices);
            setSelectedVideoDevice(videoDevices[0]);
        })();
    }, []);

    return (
        <Dialog fullWidth={true} maxWidth={"sm"} open={open} onClose={handleClose}>
            <DialogTitle>{isItAudio ? "Audio output options" : "Video output options"}</DialogTitle>
            <DialogContent>
                <DialogContentText>Choose media output from the list</DialogContentText>
                <Box
                    noValidate
                    component="form"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        m: "auto",
                        width: "fit-content",
                    }}
                >
                    {selectedVideoDevice != null ? (
                        <FormControl sx={{ mt: 2, minWidth: 320 }}>
                            <InputLabel htmlFor="max-width">Device</InputLabel>
                            <Select
                                autoFocus
                                value={
                                    isItAudio
                                        ? selectedAudioDevice.deviceId
                                        : selectedVideoDevice.groupId
                                }
                                onChange={handleOutputChange}
                                label="maxWidth"
                                inputProps={{
                                    name: "max-width",
                                    id: "max-width",
                                }}
                            >
                                {isItAudio && audioDevices != null ? (
                                    audioDevices != null && audioDevices.length > 0 ? (
                                        audioDevices.map((audio) => (
                                            <MenuItem value={audio.deviceId} key={audio.deviceId}>
                                                {audio.label}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <Box></Box>
                                    )
                                ) : videoDevices != null && videoDevices.length > 0 ? (
                                    videoDevices.map((video) => (
                                        <MenuItem value={video.groupId} key={video.groupId}>
                                            {video.label}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <Box></Box>
                                )}
                            </Select>
                        </FormControl>
                    ) : (
                        <Box> </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default MediaOutputModalView;
