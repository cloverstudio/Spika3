import React, { useEffect, useState } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import { DataGrid, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { Paper, Fab, Avatar } from "@mui/material";
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
    CheckCircleOutlineOutlined,
} from "@mui/icons-material/";
import { Room } from "@prisma/client";
import { useGet } from "../../lib/useApi";
import { useShowSnackBar } from "../../components/useUI";
import { ListResponseType } from "../../lib/customTypes";
import { successResponseType } from "../../../../../../server/components/response";

export default function RoomIndex() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [list, setList] = React.useState<Array<Room>>([]);
    const [pageSize, setPageSize] = React.useState<number>(30);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const urlParams: { userId: string } = useParams();

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

        try {
            console.log("UrlParams:" + urlParams.userId);
            const url: string =
                urlParams.userId == null
                    ? `/api/management/room?page=${page}`
                    : `/api/management/room?page=${page}&userId=${urlParams.userId}`;
            const response: successResponseType = await get(url);
            const data: ListResponseType<Room> = response.data;
            setList(data.list);
            setPageSize(data.limit);
            setTotalCount(data.count);
        } catch (e) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: "Server error, please check browser console.",
            });
        }

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
                    onClick={() => history.push(`/room/detail/${params.id}`)}
                    showInMenu
                />,
                // <GridActionsCellItem
                //     icon={<DevicesOther />}
                //     label="Devices"
                //     onClick={() => history.push(`/room/${params.id}/devices`)}
                //     showInMenu
                // />,
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={() => history.push(`/room/edit/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => history.push(`/room/delete/${params.id}`)}
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

            <Fab
                color="primary"
                aria-label="add"
                className="fab-main"
                onClick={(e) => {
                    history.push("/room/add");
                }}
            >
                <AddIcon />
            </Fab>
        </Layout>
    );
}
