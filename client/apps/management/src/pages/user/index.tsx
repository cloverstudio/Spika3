import React, { useEffect, useState } from "react";
import Layout from "../layout";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { Paper, Avatar, Stack, Button, TextField, Drawer, Box, Chip } from "@mui/material";
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
    DevicesOther,
    MeetingRoom as RoomIcon,
} from "@mui/icons-material/";
import { User } from "@prisma/client";
import {
    useGetUsersQuery,
    useGetUsersBySearchTermQuery,
    useGetVerifiedUsersQuery,
} from "../../api/user";
import UserType from "../../types/User";
import theme from "../../theme";
import { currentFilter } from "../../store/filterSlice";
import {
    show as openCreateUser,
    hide as hideCreateUser,
    selectRightSidebarOpen,
} from "../../store/rightDrawerSlice";
import { useDispatch, useSelector } from "react-redux";
import UserAdd from "../../pages/user/add";
import UserEdit from "../../pages/user/edit";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import { useDeleteUserMutation } from "../../api/user";

declare const UPLOADS_BASE_URL: string;

export interface UserMainViewProps {
    onSelect: (value: string) => void;
}

export default function Dashboard() {
    const [list, setList] = React.useState<UserType[]>([]);
    const [pageSize, setPageSize] = React.useState<number>(30);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const [page, setPage] = useState(0);
    const [verifiedPage, setVerifiedPage] = useState(0);
    const [searchTerm, setSearchTerm] = React.useState("");
    const { data, isLoading } = useGetUsersQuery(page);
    const { data: userSearchData, isLoading: userSearchIsLoading } =
        useGetUsersBySearchTermQuery(searchTerm);
    const { data: filterSearchData, isLoading: filterSearchIsLoading } =
        useGetVerifiedUsersQuery(verifiedPage);
    const filterType = useSelector(currentFilter);
    const [isFilterOn, setIsFilterOn] = React.useState<boolean>(false);
    const dispatch = useDispatch();
    const isRightDrawerOpen = useSelector(selectRightSidebarOpen);
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [deleteUser, deleteUserMutation] = useDeleteUserMutation();
    const [showEditDrawer, setShowEditDrawer] = React.useState<boolean>(false);
    const [selectedUserId, setSelectedUserId] = React.useState<number>(0);

    const hideDrawer = () => {
        setShowEditDrawer(false);
        dispatch(hideCreateUser());
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                setList(data.list);
                setPageSize(data.limit);
                setTotalCount(data.count);
            }
        })();
    }, [data]);

    useEffect(() => {
        (async () => {
            const delayDebounceFn = setTimeout(() => {
                if (!userSearchIsLoading) {
                    if (searchTerm.length > 0) {
                        setList(userSearchData.list);
                        setPageSize(userSearchData.limit);
                        setTotalCount(userSearchData.count);
                    } else {
                        setList(data.list);
                        setPageSize(data.limit);
                        setTotalCount(data.count);
                    }
                }
            }, 2000);
        })();
    }, [userSearchData]);

    useEffect(() => {
        (async () => {
            if (!filterSearchIsLoading) {
                const boolValue = filterType === "true";
                setIsFilterOn(boolValue);
                if (boolValue) {
                    setList(filterSearchData.list);
                    setPageSize(filterSearchData.limit);
                    setTotalCount(filterSearchData.count);
                } else {
                    setList(data.list);
                    setPageSize(data.limit);
                    setTotalCount(data.count);
                }
            }
        })();
    }, [filterType]);

    const datagridSx = {
        "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.spikaLightGrey.main,
            // color: "lightgrey",
            fontSize: 14,
        },
    };

    function getFullNumber(params: { getValue: (arg0: any, arg1: string) => any; id: any }) {
        return "+" + `${params.getValue(params.id, "telephoneNumber") || ""}`;
    }

    const columns = [
        { field: "id", headerName: "ID", flex: 0.2, sortable: false, filterable: false },
        {
            field: "avatarFileId",
            headerName: "Avatar",
            flex: 0.3,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams<string>) => (
                <strong>
                    <Avatar alt="Remy Sharp" src={`${UPLOADS_BASE_URL}/${params.value}`} />
                </strong>
            ),
        },
        {
            field: "displayName",
            headerName: "Display Name",
            flex: 1,
            minWidth: 300,
            sortable: false,
            filterable: false,
        },
        {
            field: "customField",
            headerName: "Phone Number",
            flex: 0.5,
            sortable: false,
            filterable: false,
            valueGetter: getFullNumber,
            sortComparator: (v1: any, v2: any) => v1!.toString().localeCompare(v2!.toString()),
        },
        {
            field: "emailAddress",
            headerName: "E-mail",
            type: "dateTime",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "verified",
            headerName: "Verified",
            type: "boolean",
            flex: 0.5,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams<boolean>) => (
                <strong>
                    {params.value ? (
                        <Chip label="Verified" size="small" color="success" />
                    ) : (
                        <Chip label="Unconfirmed" size="small" color="default" />
                    )}
                </strong>
            ),
        },
        {
            field: "actions",
            type: "actions",
            width: 80,
            getActions: (params: User) => [
                <GridActionsCellItem
                    icon={<DescriptionIcon />}
                    label="Detail"
                    onClick={() => navigate(`/user/detail/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DevicesOther />}
                    label="Devices"
                    onClick={() => navigate(`/user/${params.id}/devices`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<RoomIcon />}
                    label="Rooms"
                    onClick={() => navigate(`/user/${params.id}/room`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={(e) => {
                        setSelectedUserId(params.id);
                        setShowEditDrawer(true);
                        dispatch(openCreateUser());
                    }}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={(e) => {
                        showBasicDialog({ text: "Please confirm delete." }, async () => {
                            try {
                                await deleteUser(params.id);
                            } catch (e) {
                                console.error(e);
                                showSnackBar({
                                    severity: "error",
                                    text: "Server error, please check browser console.",
                                });
                            }
                        });
                    }}
                    showInMenu
                />,
            ],
        },
    ];

    return (
        <Layout subtitle="Users">
            <Paper
                sx={{
                    margin: "24px",
                    padding: "24px",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        mb: "1em",
                    }}
                >
                    <TextField
                        label="Search User"
                        id="outlined-size-small"
                        size="small"
                        sx={{ minWidth: 400 }}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <Button
                        type="submit"
                        color="spikaButton"
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => dispatch(openCreateUser())}
                    >
                        ADD USER
                    </Button>
                </Stack>

                <div style={{ display: "flex", width: "100%", flexGrow: 1 }}>
                    <DataGrid
                        autoHeight
                        rows={list}
                        columns={columns}
                        pageSize={pageSize}
                        rowCount={totalCount}
                        pagination
                        paginationMode="server"
                        rowsPerPageOptions={[10, 20]}
                        onPageChange={(newPage) => setPage(newPage)}
                        loading={isLoading}
                        sx={datagridSx}
                    />
                </div>
                <Drawer
                    PaperProps={{
                        sx: {
                            backgroundColor: theme.palette.spikaMainBackgroundColor.main,
                        },
                    }}
                    anchor="right"
                    sx={{ zIndex: 1300 }}
                    open={isRightDrawerOpen}
                    onClose={hideDrawer}
                >
                    <Box width={400}>
                        {showEditDrawer ? (
                            <UserEdit userId={String(selectedUserId)} />
                        ) : (
                            <UserAdd />
                        )}
                    </Box>
                </Drawer>
            </Paper>
        </Layout>
    );
}
