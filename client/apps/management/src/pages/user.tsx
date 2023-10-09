import React from "react";
import { Box } from "@mui/material";
import { useGetUserByIdQuery,useGetBotByIdQuery } from "@/features/users/api/users";
import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { useParams } from "react-router-dom";
import UserDetails from "@/features/users/UserDetails";
import BotDetails from "@/features/users/BotDetails";

export default function Users(): React.ReactElement {
    const id = useParams().id;
    const userRequest = useGetUserByIdQuery(id);
    const botRequest = useGetBotByIdQuery(id);
    const strings = useStrings();

    if (userRequest.isLoading || botRequest.isLoading) {
        return <Loader />;
    }

    if (userRequest.isError || userRequest.data.status === "error") {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="95vh">
                {strings.errorWhileFetchingUser}
            </Box>
        );
    }

    return (
        <Box
            borderLeft="1px solid"
            height="100vh"
            overflow="auto"
            display="grid"
            alignContent="start"
            sx={{ borderColor: "divider" }}
        >
            <Box p={{ base: 2, md: 3, lg: 6 }}>
                { userRequest.data.data.user.isBot ? 
                    <BotDetails user={botRequest.data.data.user} />:
                    <UserDetails user={userRequest.data.data.user} />
                }
            </Box>
        </Box>
    );
}
