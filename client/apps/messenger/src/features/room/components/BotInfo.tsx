import React from "react";
import { Avatar, Box, Button, Typography } from "@mui/material";
import UserType from "../../../types/User";
import CameraAlt from "@mui/icons-material/CameraAlt";
import ImageIcon from "@mui/icons-material/Image";
import useStrings from "../../../hooks/useStrings";
import { useSearchParams } from "react-router-dom";

export default function BotInfo({ bot }: { bot: UserType }) {
    const strings = useStrings();
    const [, setSearchParams] = useSearchParams();

    const handleStart = () => {
        setSearchParams();
    };

    return (
        <Box>
            <Box>
                <Avatar
                    sx={{ width: "100%", height: 350, borderRadius: 0 }}
                    imgProps={{
                        sx: {
                            objectPosition: "center",
                        },
                    }}
                    alt={bot.displayName}
                    src={`${UPLOADS_BASE_URL}/${bot.coverFileId}`}
                >
                    <ImageIcon fontSize="large" />
                </Avatar>
                <Box mx={4} mt="-100px" display="grid" gap={4}>
                    <Avatar
                        sx={{ width: 200, height: 200, border: "4px solid white" }}
                        alt={bot.displayName}
                        src={`${UPLOADS_BASE_URL}/${bot.avatarFileId}`}
                    >
                        <CameraAlt />
                    </Avatar>
                    <Box display="grid" gap={1}>
                        <Typography variant="h3" fontWeight="bold">
                            {bot.displayName}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                            {bot.shortDescription}
                        </Typography>

                        <Typography variant="body1">{bot.longDescription}</Typography>
                    </Box>
                    <Box>
                        <Button onClick={handleStart} variant="contained">
                            {strings.startChat}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
