import React from "react";
import { Box } from "@mui/material";
import { useGetUserByIdQuery } from "@/features/users/api/users";
import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { useParams } from "react-router-dom";
import UserDetails from "@/features/users/UserDetails";

export default function Users(): React.ReactElement {
    const id = useParams().id;
    const { data, isLoading, isError } = useGetUserByIdQuery(id);
    const strings = useStrings();

    if (isLoading) {
        return <Loader />;
    }

    if (isError || data.status === "error") {
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
                <UserDetails user={data.data.user} />
            </Box>
        </Box>
    );
}
