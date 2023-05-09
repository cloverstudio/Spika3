import React, { useState } from "react";
import { Box, IconButton, Pagination, Typography } from "@mui/material";
import { useGetGroupsQuery } from "@/features/groups/api/groups";
import Loader from "@/components/Loader";
import useStrings from "@/hooks/useStrings";
import { Outlet } from "react-router-dom";
import GroupList from "@/features/groups/GroupList";
import NewGroupModal from "@/features/groups/NewGroupModal";
import AddIcon from "@mui/icons-material/Add";
import SearchBox from "@/features/groups/SearchBox";

export default function Groups(): React.ReactElement {
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [showNewGroupModal, setShowNewGroupModal] = useState(false);
    const { data, isLoading, isError } = useGetGroupsQuery({ page, keyword });
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
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
                        <Typography variant="h2" textAlign="center" fontWeight="bold">
                            {strings.groups}
                        </Typography>
                        <IconButton
                            size="large"
                            onClick={() => setShowNewGroupModal(true)}
                            color="primary"
                        >
                            <AddIcon />
                        </IconButton>
                    </Box>
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
                <GroupList groups={data.data.list} />
            </Box>

            {showNewGroupModal && <NewGroupModal onClose={() => setShowNewGroupModal(false)} />}

            <Outlet />
        </Box>
    );
}
