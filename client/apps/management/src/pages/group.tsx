import React from "react";
import { Box } from "@mui/material";
import { useGetGroupByIdQuery } from "@/features/groups/api/groups";
import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { useParams } from "react-router-dom";
import GroupDetails from "@/features/groups/GroupDetails";

export default function Groups(): React.ReactElement {
    const id = +useParams().id;
    const { data, isLoading, isError } = useGetGroupByIdQuery(id);
    const strings = useStrings();

    if (isLoading) {
        return <Loader />;
    }

    if (isError || data.status === "error") {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="95vh">
                {strings.errorWhileFetchingGroup}
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
                <GroupDetails group={data.data.group} />
            </Box>
        </Box>
    );
}
