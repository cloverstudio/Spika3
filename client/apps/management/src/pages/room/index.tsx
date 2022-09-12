import React, { useEffect, useState } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { Paper, Avatar, Stack, TextField, Button, Drawer, Box } from "@mui/material";
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
    CheckCircleOutlineOutlined,
} from "@mui/icons-material/";
import { Room } from "@prisma/client";

import { createTheme, darken, lighten } from "@mui/material/styles";
import { makeStyles } from "@material-ui/styles";
import {
    useGetRoomsQuery,
    useGetRoomsForUserQuery,
    useGetDeletedRoomsQuery,
    useGetDeletedRoomsForUserQuery,
} from "../../api/room";
import RoomType from "../../types/Room";
import {
    show as openCreateRoom,
    hide as hideCreateRoom,
    selectRightSidebarOpen,
} from "../../store/rightDrawerSlice";
import { useDispatch, useSelector } from "react-redux";
import theme from "../../theme";
import RoomAdd from "../../pages/room/add";
import RoomEdit from "../../pages/room/edit";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import {
    useUpdateRoomMutation,
    useGetRoomsBySearchTermQuery,
    useGetGroupRoomsQuery,
} from "../../api/room";
import { currentFilter } from "../../store/filterSlice";

declare const UPLOADS_BASE_URL: string;

export default function RoomIndex() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [list, setList] = React.useState<RoomType[]>([]);
    const [pageSize, setPageSize] = React.useState<number>(30);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const [deleteFilter, setDeleteFilter] = React.useState<boolean>(false);
    const [page, setPage] = useState(0);
    const urlParams = useParams();
    const [searchTerm, setSearchTerm] = React.useState("");
    const dispatch = useDispatch();
    const filterType = useSelector(currentFilter);
    const isRightDrawerOpen = useSelector(selectRightSidebarOpen);
    const [showEditDrawer, setShowEditDrawer] = React.useState<boolean>(false);
    const [selectedRoomId, setSelectedRoomId] = React.useState<number>(0);
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [updateRoom, updateRoomMutation] = useUpdateRoomMutation();
    const { data: roomSearchData, isLoading: roomSearchIsLoading } =
        useGetRoomsBySearchTermQuery(searchTerm);
    const { data: filterSearchData, isLoading: filterSearchIsLoading } = useGetGroupRoomsQuery({
        page: page,
        type: filterType,
    });

    const navigate = useNavigate();

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };
    const hideDrawer = () => {
        setShowEditDrawer(false);
        dispatch(hideCreateRoom());
    };

    const { data, isLoading } = !deleteFilter
        ? urlParams.id == null
            ? useGetRoomsQuery(page)
            : useGetRoomsForUserQuery({ page: page, userId: urlParams.id })
        : urlParams.id == null
        ? useGetDeletedRoomsQuery({ page: page, deleted: deleteFilter })
        : useGetDeletedRoomsForUserQuery({
              page: page,
              userId: urlParams.id,
              deleted: deleteFilter,
          });

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
                if (!roomSearchIsLoading) {
                    if (searchTerm.length > 0) {
                        setList(roomSearchData.list);
                        setPageSize(roomSearchData.limit);
                        setTotalCount(roomSearchData.count);
                    } else {
                        setList(data.list);
                        setPageSize(data.limit);
                        setTotalCount(data.count);
                    }
                }
            }, 2000);
        })();
    }, [roomSearchData]);

    useEffect(() => {
        (async () => {
            if (!filterSearchIsLoading) {
                if (filterType === "group" || filterType === "private") {
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

    useEffect(() => {
        (async () => {})();
    }, [deleteFilter]);

    const columns = [
        { field: "id", headerName: "ID", flex: 0.2, sortable: false, filterable: false },
        {
            field: "avatarUrl",
            headerName: "Avatar",
            flex: 0.3,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams<string>) => (
                <strong>
                    <Avatar alt="Remy Sharp" src={`${UPLOADS_BASE_URL}${params.value}`} />
                </strong>
            ),
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 300,
            sortable: false,
            filterable: false,
        },
        {
            field: "type",
            headerName: "Type",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "deleted",
            headerName: "Deleted",
            type: "boolean",
            flex: 0.5,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams<boolean>) => (
                <strong>
                    {!params.value ? "" : <CheckCircleOutlineOutlined style={{ fill: "red" }} />}
                </strong>
            ),
        },
        // {
        //     field: "createdAt",
        //     headerName: "Created",
        //     type: "dateTime",
        //     flex: 0.5,
        //     sortable: false,
        //     filterable: false,
        // },
        // {
        //     field: "modifiedAt",
        //     headerName: "Modified",
        //     type: "dateTime",
        //     flex: 0.5,
        //     sortable: false,
        //     filterable: false,
        // },
        {
            field: "actions",
            type: "actions",
            width: 80,
            getActions: (params: Room) => [
                <GridActionsCellItem
                    icon={<DescriptionIcon />}
                    label="Detail"
                    onClick={() => navigate(`/room/detail/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={(e) => {
                        setSelectedRoomId(params.id);
                        setShowEditDrawer(true);
                        dispatch(openCreateRoom());
                    }}
                    showInMenu
                />,
            ],
        },
    ];

    return (
        <Layout subtitle="Rooms">
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
                        label="Search Room"
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
                        onClick={() => dispatch(openCreateRoom())}
                    >
                        ADD ROOM
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
                        onPageChange={(newPage) => setPage(newPage)}
                        loading={loading}
                        getRowClassName={(params) =>
                            `super-app-theme--${params.getValue(params.id, "deleted")}`
                        }
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
                            <RoomEdit roomId={String(selectedRoomId)} />
                        ) : (
                            <RoomAdd />
                        )}
                    </Box>
                </Drawer>
            </Paper>
        </Layout>
    );
}
