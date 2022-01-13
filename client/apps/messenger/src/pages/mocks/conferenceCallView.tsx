import React from "react";
import { Fab, Drawer, Box, Stack, IconButton } from "@mui/material";
import { Menu, Videocam, Mic, Groups, Monitor, Close } from "@mui/icons-material";

function ConferenceCallView() {
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        console.log("click");
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleCamera = () => {};

    const handleMic = () => {};
    const handleGroup = () => {};
    const handleShare = () => {};

    const closeConference = () => {};

    return (
        <Box sx={{ display: "flex" }} position="relative">
            <Fab
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
            </Drawer>
            <Box my={1} display="flex" justifyContent="center">
                Test
            </Box>
            <Box
                position="fixed"
                bottom="0"
                left="0"
                bgcolor="black"
                height="8%"
                width="100%"
                sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}
                >
                    <IconButton onClick={handleCamera}>
                        <Videocam style={{ fill: "white" }} />
                    </IconButton>
                    <IconButton onClick={handleMic}>
                        <Mic style={{ fill: "white" }} />
                    </IconButton>
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
        </Box>
    );
}

export default ConferenceCallView;
