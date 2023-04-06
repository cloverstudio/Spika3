import React, { useState } from "react";
import { Box, Pagination, Typography } from "@mui/material";
import { useGetUsersQuery } from "@/features/users/api/users";
import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { Outlet } from "react-router-dom";
import UserList from "@/features/users/UserList";
import SearchBox from "@/features/groups/SearchBox";

export default function Users(): React.ReactElement {
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const { data, isLoading, isError } = useGetUsersQuery({ page, keyword });
    const strings = useStrings();

    if (isLoading) {
        return <Loader />;
    }

    if (isError || data.status === "error") {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="95vh">
                {strings.errorWhileFetchingUsers}
            </Box>
        );
    }

    const handlePageChange = (_, newPage) => {
        setPage(newPage);
    };

    const pageCount = Math.ceil(data.data.count / data.data.limit);

    return (
        <Box
            display="grid"
            sx={{
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "26rem 3fr",
                },
            }}
        >
            <Box
                maxHeight="100vh"
                overflow="auto"
                p={{ base: 2, md: 3, lg: 5 }}
                display="grid"
                gap={3}
                alignContent="start"
            >
                <Box>
                    <Typography textAlign="center" variant="h2" mb={2} fontWeight="bold">
                        {strings.users}
                    </Typography>
                    <Box mx="auto" mb={-2}>
                        <SearchBox
                            onSearch={(val) => {
                                setPage(1);
                                setKeyword(val);
                            }}
                        />
                    </Box>
                </Box>
                {pageCount > 1 && (
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={handlePageChange}
                        size="small"
                        sx={{ mx: "auto" }}
                    />
                )}
                <UserList users={data.data.list} />
            </Box>

            <Outlet />
        </Box>
    );
}
