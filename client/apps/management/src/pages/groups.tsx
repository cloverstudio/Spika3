import React, { useState } from "react";
import { Box, Pagination, Typography } from "@mui/material";
import { useGetGroupsQuery } from "@/features/groups/api/groups";
import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { Outlet } from "react-router-dom";
import GroupList from "@/features/groups/GroupList";

export default function Groups(): React.ReactElement {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useGetGroupsQuery(page);
    const strings = useStrings();

    if (isLoading) {
        return <Loader />;
    }

    if (isError || data.status === "error") {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="95vh">
                {strings.errorWhileFetchingGroups}
            </Box>
        );
    }

    const handlePageChange = (_, newPage) => {
        setPage(newPage);
    };

    return (
        <Box
            display="grid"
            sx={{
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "2fr 3fr",
                },
            }}
        >
            <Box
                maxHeight="100vh"
                overflow="auto"
                p={{ base: 2, md: 3, lg: 6 }}
                display="grid"
                gap={4}
                alignContent="start"
            >
                <Typography variant="h2" textAlign="center" fontWeight="bold">
                    {strings.groups}
                </Typography>
                <Pagination
                    count={Math.floor(data.data.count / data.data.limit)}
                    page={page}
                    onChange={handlePageChange}
                    size="small"
                    sx={{ mx: "auto" }}
                />
                <GroupList groups={data.data.list} />
            </Box>

            <Outlet />
        </Box>
    );
}
